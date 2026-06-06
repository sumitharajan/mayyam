const http = require('http');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 8085);
const HOST = process.env.HOST || '127.0.0.1';

const clusters = [
  {
    id: 'cluster-1',
    name: 'dev-cluster',
    cluster_type: 'kubernetes',
    config: { api_server_url: 'https://dev-k8s.example.local', token: 'present' },
  },
  {
    id: 'cluster-2',
    name: 'staging-cluster',
    cluster_type: 'kubernetes',
    config: { api_server_url: 'https://staging-k8s.example.local', token: 'present' },
  },
];

const namespaces = [{ name: 'default' }, { name: 'apps' }, { name: 'observability' }];
const deployments = [
  { name: 'api', namespace: 'default', replicas: 3, ready_replicas: 3, available_replicas: 3, updated_replicas: 3, age: '12d', images: ['ghcr.io/mayyam/api:latest'] },
  { name: 'web', namespace: 'apps', replicas: 2, ready_replicas: 2, available_replicas: 2, updated_replicas: 2, age: '8d', images: ['ghcr.io/mayyam/web:latest'] },
];
const services = [
  { name: 'api', namespace: 'default', type: 'ClusterIP', cluster_ip: '10.0.0.10', ports: [80, 443] },
  { name: 'web', namespace: 'apps', type: 'LoadBalancer', cluster_ip: '10.0.0.11', ports: [80] },
];
const daemonSets = [{ name: 'node-exporter', namespace: 'observability', desired: 3, current: 3, ready: 3, age: '30d' }];
const statefulSets = [{ name: 'postgres', namespace: 'default', replicas: 1, ready_replicas: 1, age: '40d' }];
const pvcs = [{ name: 'data-postgres-0', namespace: 'default', status: 'Bound', capacity: '20Gi', age: '40d' }];
const pvs = [{ name: 'pv-data-postgres-0', status: 'Bound', capacity: '20Gi', access_modes: ['RWO'], age: '40d' }];
const nodes = [
  { name: 'ip-10-0-0-1', status: 'Ready', roles: ['control-plane'], age: '40d' },
  { name: 'ip-10-0-0-2', status: 'Ready', roles: ['worker'], age: '40d' },
];
const pods = [
  { name: 'api-7f5d9', namespace: 'default', status: 'Running', node_name: 'ip-10-0-0-2', age: '12d', restart_count: 0, containers: [{ name: 'api', ready: true }] },
  { name: 'web-6c8c7', namespace: 'apps', status: 'Running', node_name: 'ip-10-0-0-1', age: '8d', restart_count: 1, containers: [{ name: 'web', ready: true }] },
];
const configMaps = [{ name: 'app-config', namespace: 'default', age: '12d' }];
const secrets = [{ name: 'db-secret', namespace: 'default', type: 'Opaque', age: '12d' }];
const metrics = {
  metrics_available: true,
  message: 'Metrics available',
  node_totals: { count: 2, cpu_formatted: '1.6', memory_formatted: '5.4Gi' },
  pod_totals: { count: 2, cpu_formatted: '340m', memory_formatted: '512Mi' },
  nodes: [
    { name: 'ip-10-0-0-1', cpu_formatted: '900m', memory_formatted: '3.2Gi' },
    { name: 'ip-10-0-0-2', cpu_formatted: '700m', memory_formatted: '2.2Gi' },
  ],
  pods: [
    { name: 'api-7f5d9', namespace: 'default', cpu_formatted: '220m', memory_formatted: '256Mi' },
    { name: 'web-6c8c7', namespace: 'apps', cpu_formatted: '120m', memory_formatted: '256Mi' },
  ],
};

function base64Url(input) {
  return Buffer.from(JSON.stringify(input)).toString('base64url');
}

function tokenForUser(username) {
  return `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url({
    sub: username,
    username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    iat: Math.floor(Date.now() / 1000),
  })}.`;
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body === null ? '' : JSON.stringify(body));
}

function sendText(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }
      const raw = Buffer.concat(chunks).toString('utf8');
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${HOST}:${PORT}`).pathname;

  if (req.method === 'GET' && pathname === '/health') return sendJson(res, 200, { status: 'ok' });

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const body = await readBody(req);
    const username = body?.username || 'demo';
    return sendJson(res, 200, { token: tokenForUser(username), token_type: 'Bearer' });
  }

  if (req.method === 'POST' && pathname === '/api/auth/register') return sendJson(res, 201, { status: 'ok' });

  if (req.method === 'GET' && pathname === '/api/kubernetes-clusters') return sendJson(res, 200, clusters);
  if (req.method === 'POST' && pathname === '/api/kubernetes-clusters') return sendJson(res, 201, { id: 'cluster-new', ...(await readBody(req)) });

  const clusterMatch = pathname.match(/^\/api\/kubernetes-clusters\/([^/]+)$/);
  if (clusterMatch) {
    const cluster = clusters.find((c) => c.id === clusterMatch[1]) || clusters[0];
    if (req.method === 'GET') return sendJson(res, 200, cluster);
    if (req.method === 'PUT') return sendJson(res, 200, { ...cluster, ...(await readBody(req)) });
    if (req.method === 'DELETE') return sendJson(res, 204, null);
  }

  const k8s = pathname.match(/^\/api\/kubernetes\/clusters\/([^/]+)(.*)$/);
  if (k8s) {
    const rest = k8s[2];
    if (req.method === 'GET' && rest === '/namespaces') return sendJson(res, 200, namespaces);
    if (req.method === 'GET' && rest === '/deployments') return sendJson(res, 200, deployments);
    if (req.method === 'GET' && rest === '/services') return sendJson(res, 200, services);
    if (req.method === 'GET' && rest === '/daemonsets') return sendJson(res, 200, daemonSets);
    if (req.method === 'GET' && rest === '/statefulsets') return sendJson(res, 200, statefulSets);
    if (req.method === 'GET' && rest === '/persistentvolumeclaims') return sendJson(res, 200, pvcs);
    if (req.method === 'GET' && rest === '/persistentvolumes') return sendJson(res, 200, pvs);
    if (req.method === 'GET' && rest === '/nodes') return sendJson(res, 200, nodes);
    if (req.method === 'GET' && rest === '/metrics') return sendJson(res, 200, metrics);
    if (req.method === 'GET' && rest === '/namespaces/default/deployments') return sendJson(res, 200, deployments.filter((d) => d.namespace === 'default'));
    if (req.method === 'GET' && rest === '/namespaces/apps/deployments') return sendJson(res, 200, deployments.filter((d) => d.namespace === 'apps'));
    if (req.method === 'GET' && rest === '/namespaces/default/services') return sendJson(res, 200, services.filter((d) => d.namespace === 'default'));
    if (req.method === 'GET' && rest === '/namespaces/apps/services') return sendJson(res, 200, services.filter((d) => d.namespace === 'apps'));
    if (req.method === 'GET' && rest === '/namespaces/default/daemonsets') return sendJson(res, 200, daemonSets);
    if (req.method === 'GET' && rest === '/namespaces/default/statefulsets') return sendJson(res, 200, statefulSets);
    if (req.method === 'GET' && rest === '/namespaces/default/persistentvolumeclaims') return sendJson(res, 200, pvcs);
    if (req.method === 'GET' && rest === '/namespaces/default/pods') return sendJson(res, 200, pods.filter((p) => p.namespace === 'default'));
    if (req.method === 'GET' && rest === '/namespaces/apps/pods') return sendJson(res, 200, pods.filter((p) => p.namespace === 'apps'));
    if (req.method === 'GET' && rest === '/namespaces/default/configmaps') return sendJson(res, 200, configMaps);
    if (req.method === 'GET' && rest === '/namespaces/default/secrets') return sendJson(res, 200, secrets);

    const podMatch = rest.match(/^\/namespaces\/([^/]+)\/pods\/([^/]+)(.*)$/);
    if (podMatch) {
      const namespace = podMatch[1];
      const podName = podMatch[2];
      const suffix = podMatch[3];
      if (req.method === 'GET' && suffix === '') return sendJson(res, 200, pods.find((p) => p.name === podName && p.namespace === namespace) || { name: podName, namespace, status: 'Running', containers: [] });
      if (req.method === 'GET' && suffix === '/events') return sendJson(res, 200, [{ type: 'Normal', reason: 'Started', message: 'Pod started successfully' }]);
      if (req.method === 'GET' && suffix === '/logs') return sendText(res, 200, `Mock logs for ${podName} in ${namespace}\nLine 1\nLine 2\n`);
      if (req.method === 'GET' && suffix === '/logs/stream') return sendText(res, 200, `Mock streaming logs for ${podName}\n`);
      if (req.method === 'POST' && suffix === '/exec') return sendJson(res, 200, { output: `Executed command in ${podName}` });
    }

    const workloadPodsMatch = rest.match(/^\/namespaces\/([^/]+)\/(deployments|daemonsets|statefulsets)\/([^/]+)\/pods$/);
    if (req.method === 'GET' && workloadPodsMatch) return sendJson(res, 200, pods);

    const resourceMatch = rest.match(/^\/namespaces\/([^/]+)\/(configmaps|secrets)\/([^/]+)$/);
    if (req.method === 'GET' && resourceMatch) {
      const namespace = resourceMatch[1];
      const kind = resourceMatch[2];
      const name = resourceMatch[3];
      const list = kind === 'configmaps' ? configMaps : secrets;
      return sendJson(res, 200, list.find((item) => item.name === name && item.namespace === namespace) || { name, namespace });
    }
  }

  return sendJson(res, 404, { message: `No mock handler for ${pathname}` });
});

server.listen(PORT, HOST, () => {
  console.log(`Mock API listening on http://${HOST}:${PORT}`);
});
