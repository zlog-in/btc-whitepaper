// ==========================================
// P2P 网络模拟
// ==========================================

const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');
const nodeCountEl = document.getElementById('node-count');
const connectionCountEl = document.getElementById('connection-count');
const messageStatusEl = document.getElementById('message-status');

let nodes = [];
let connections = [];
let animatingNodes = new Set();
let messageQueue = [];

const COLORS = {
    node: '#f7931a',
    nodeStroke: '#e8850f',
    nodeActive: '#22c55e',
    connection: '#e0e0e0',
    connectionActive: '#f7931a',
    text: '#1a1a1a'
};

class Node {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.neighbors = [];
        this.active = false;
        this.pulseRadius = 0;
        this.pulseAlpha = 0;
    }

    draw() {
        // 脉冲动画
        if (this.pulseAlpha > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(34, 197, 94, ${this.pulseAlpha})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // 节点圆形
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.active ? COLORS.nodeActive : COLORS.node;
        ctx.fill();
        ctx.strokeStyle = this.active ? '#16a34a' : COLORS.nodeStroke;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 节点编号
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.id, this.x, this.y);
    }

    pulse() {
        this.active = true;
        this.pulseRadius = this.radius;
        this.pulseAlpha = 1;
    }

    update() {
        if (this.pulseAlpha > 0) {
            this.pulseRadius += 2;
            this.pulseAlpha -= 0.02;
            if (this.pulseAlpha <= 0) {
                this.pulseAlpha = 0;
                this.active = false;
            }
        }
    }
}

function drawConnection(node1, node2, active = false) {
    ctx.beginPath();
    ctx.moveTo(node1.x, node1.y);
    ctx.lineTo(node2.x, node2.y);
    ctx.strokeStyle = active ? COLORS.connectionActive : COLORS.connection;
    ctx.lineWidth = active ? 3 : 2;
    ctx.stroke();
}

function updateStats() {
    nodeCountEl.textContent = nodes.length;
    connectionCountEl.textContent = connections.length;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制连接
    connections.forEach(([i, j]) => {
        const active = animatingNodes.has(i) || animatingNodes.has(j);
        drawConnection(nodes[i], nodes[j], active);
    });

    // 绘制节点
    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    requestAnimationFrame(render);
}

function addNode() {
    const id = nodes.length + 1;
    const padding = 50;
    const x = padding + Math.random() * (canvas.width - padding * 2);
    const y = padding + Math.random() * (canvas.height - padding * 2);

    const node = new Node(id, x, y);
    nodes.push(node);

    // 连接到最近的几个节点
    if (nodes.length > 1) {
        const distances = nodes.slice(0, -1).map((n, i) => ({
            index: i,
            dist: Math.hypot(n.x - x, n.y - y)
        }));
        distances.sort((a, b) => a.dist - b.dist);

        const connectCount = Math.min(2 + Math.floor(Math.random() * 2), distances.length);
        for (let i = 0; i < connectCount; i++) {
            const neighborIndex = distances[i].index;
            node.neighbors.push(neighborIndex);
            nodes[neighborIndex].neighbors.push(nodes.length - 1);
            connections.push([nodes.length - 1, neighborIndex]);
        }
    }

    updateStats();
}

function broadcast(startNodeIndex = 0) {
    if (nodes.length === 0) return;

    const visited = new Set();
    const queue = [[startNodeIndex, 0]];
    visited.add(startNodeIndex);

    messageStatusEl.textContent = typeof t === 'function' ? t('p2p.status.broadcasting') : '广播中...';

    function processQueue() {
        if (queue.length === 0) {
            setTimeout(() => {
                animatingNodes.clear();
                messageStatusEl.textContent = typeof t === 'function' ? t('p2p.status.complete') : '完成';
                setTimeout(() => {
                    messageStatusEl.textContent = typeof t === 'function' ? t('p2p.status.idle') : '空闲';
                }, 1000);
            }, 500);
            return;
        }

        const [nodeIndex, delay] = queue.shift();

        setTimeout(() => {
            nodes[nodeIndex].pulse();
            animatingNodes.add(nodeIndex);

            nodes[nodeIndex].neighbors.forEach(neighborIndex => {
                if (!visited.has(neighborIndex)) {
                    visited.add(neighborIndex);
                    queue.push([neighborIndex, 0]);
                }
            });

            processQueue();
        }, delay === 0 ? 0 : 300);
    }

    processQueue();
}

function resetNetwork() {
    nodes = [];
    connections = [];
    animatingNodes.clear();
    messageQueue = [];
    updateStats();
    messageStatusEl.textContent = typeof t === 'function' ? t('p2p.status.idle') : '空闲';

    // 添加初始节点
    for (let i = 0; i < 5; i++) {
        addNode();
    }
}

// 点击节点发起广播
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    nodes.forEach((node, index) => {
        const dist = Math.hypot(node.x - x, node.y - y);
        if (dist <= node.radius) {
            broadcast(index);
        }
    });
});

// 按钮事件
document.getElementById('add-node-btn').addEventListener('click', addNode);
document.getElementById('broadcast-btn').addEventListener('click', () => broadcast(0));
document.getElementById('reset-network-btn').addEventListener('click', resetNetwork);

// 初始化
resetNetwork();
render();
