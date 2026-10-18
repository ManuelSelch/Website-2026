<?php
// Isolated addon tests: no Cockpit server, credentials or production data.
class MemoryStorage {
    public array $records = [];
    public bool $failHistory = false;
    public function findOne($collection, $filter) {
        foreach ($this->records[$collection] ?? [] as $record) {
            $match = true;
            foreach ($filter as $field => $value) if (($record[$field] ?? null) !== $value) $match = false;
            if ($match) return $record;
        }
        return null;
    }
    public function save($collection, &$record) {
        if ($this->failHistory && $collection === 'portfolio/authoring-history') throw new RuntimeException('Disk full');
        $this->records[$collection][$record['_id']] = $record;
    }
}
class FixtureApp {
    public MemoryStorage $dataStorage;
    public array $hooks = [];
    public string $directory;
    public function __construct($directory) { $this->directory = $directory; $this->dataStorage = new MemoryStorage(); }
    public function path($path) { return $this->directory; }
    public function on($name, $callback) { $this->hooks[$name] = $callback; }
    public function install($file) { include $file; }
    public function save(array $patch) {
        $collection = 'content/collections/projects';
        $current = $this->dataStorage->findOne($collection, ['_id' => $patch['_id']]);
        $item = array_merge($current ?? [], $patch, ['_modified' => time(), '_mby' => null]);
        ($this->hooks['content.item.save.before.projects'])($item, true, $collection);
        $this->dataStorage->save($collection, $item);
        ($this->hooks['content.item.save.projects'])($item);
        return $item;
    }
}
function expect($condition, $message) { if (!$condition) throw new RuntimeException($message); }
$directory = sys_get_temp_dir() . '/portfolio-hooks-' . bin2hex(random_bytes(8));
mkdir($directory, 0700);
try {
    $app = new FixtureApp($directory);
    $app->install(__DIR__ . '/../docs/cockpit/addons/PortfolioAuthoring/bootstrap.php');
    $initial = ['_id' => 'id', 'slug' => 'project', 'title' => 'Original', '_state' => 1, 'gallery' => []];
    $app->dataStorage->save('content/collections/projects', $initial);
    $hash = $GLOBALS['portfolio_authoring_v1']['revision'];
    $oldRevision = $hash($initial);
    $humanEdit = $app->save(['_id' => 'id', 'title' => 'Human edited text']);
    $GLOBALS['portfolio_authoring_context'] = ['action' => 'set-media', 'revision' => $oldRevision, 'patch' => ['gallery' => [['_id' => 'asset']]]];
    try { $app->save(['_id' => 'id', 'gallery' => [['_id' => 'asset']]]); throw new RuntimeException('Stale revision accepted'); }
    catch (RuntimeException $error) { expect($error->getCode() === 409, 'Expected revision conflict'); }
    $GLOBALS['portfolio_authoring_context']['revision'] = $hash($humanEdit);
    $saved = $app->save(['_id' => 'id', 'gallery' => [['_id' => 'asset']]]);
    expect($saved['title'] === 'Human edited text', 'Media replaced human text');
    expect($saved['_state'] === 1, 'Media changed publication');
    expect(count($saved['gallery']) === 1, 'Media missing');
    $history = array_values($app->dataStorage->records['portfolio/authoring-history']);
    expect(count($history) === 2, 'History must include editor and agent changes, not rejected changes');
    expect($history[1]['before']['title'] === 'Human edited text', 'Missing recoverable text snapshot');
    expect($history[1]['status'] === 'committed', 'History status missing');
    // Equivalent key order must not create a different revision.
    expect($hash($initial) === $hash(array_reverse($initial, true)), 'Revision depends on field order');
    unset($GLOBALS['portfolio_authoring_context']);
    $app->dataStorage->failHistory = true;
    try { $app->save(['_id' => 'id', 'title' => 'Must not save']); throw new RuntimeException('Missing history accepted'); }
    catch (RuntimeException $error) { expect($error->getMessage() === 'Disk full', 'Expected history failure'); }
    expect($app->dataStorage->findOne('content/collections/projects', ['_id' => 'id'])['title'] === 'Human edited text', 'History failure changed content');
    echo "PASS editor history, stale snapshot rejection, media isolation, revision stability and history failure safety\n";
} finally {
    ($GLOBALS['portfolio_authoring_v1']['release'])();
    @unlink($directory . '/.portfolio-authoring-locks/projects.lock');
    @rmdir($directory . '/.portfolio-authoring-locks');
    @rmdir($directory);
    unset($GLOBALS['portfolio_authoring_context']);
}
