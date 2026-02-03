// ==========================================
// 共识传播演示
// ==========================================

// ==========================================
// 区块传播演示
// ==========================================
const canvas = document.getElementById('propagation-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let nodes = [];
let connections = [];
let propagationState = {
    active: false,
    sourceNode: null,
    receivedNodes: new Set(),
    currentHop: 0,
    queue: []
};

const COLORS = {
    waiting: '#6b7280',
    received: '#22c55e',
    source: '#f7931a',
    connection: '#e5e7eb',
    connectionActive: '#22c55e',
    pulse: 'rgba(34, 197, 94, 0.3)'
};

class NetworkNode {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = 22;
        this.neighbors = [];
        this.state = 'waiting'; // waiting, received, source
        this.pulseRadius = 0;
        this.pulseAlpha = 0;
    }

    draw() {
        // 脉冲动画
        if (this.pulseAlpha > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.pulseRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(34, 197, 94, ${this.pulseAlpha * 0.3})`;
            ctx.fill();
        }

        // 节点圆形
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (this.state === 'source') {
            ctx.fillStyle = COLORS.source;
        } else if (this.state === 'received') {
            ctx.fillStyle = COLORS.received;
        } else {
            ctx.fillStyle = COLORS.waiting;
        }
        ctx.fill();

        // 边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 节点图标
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.state === 'source') {
            ctx.fillText('⛏️', this.x, this.y);
        } else if (this.state === 'received') {
            ctx.fillText('📦', this.x, this.y);
        } else {
            ctx.fillText('🖥️', this.x, this.y);
        }
    }

    pulse() {
        this.pulseRadius = this.radius;
        this.pulseAlpha = 1;
    }

    update() {
        if (this.pulseAlpha > 0) {
            this.pulseRadius += 3;
            this.pulseAlpha -= 0.02;
            if (this.pulseAlpha < 0) this.pulseAlpha = 0;
        }
    }
}

function initNetwork() {
    if (!canvas) return;

    nodes = [];
    connections = [];
    propagationState = {
        active: false,
        sourceNode: null,
        receivedNodes: new Set(),
        currentHop: 0,
        queue: []
    };

    // 创建节点网格
    const positions = [
        { x: 100, y: 80 }, { x: 250, y: 60 }, { x: 400, y: 50 }, { x: 550, y: 70 }, { x: 700, y: 90 },
        { x: 80, y: 200 }, { x: 200, y: 180 }, { x: 350, y: 200 }, { x: 500, y: 190 }, { x: 650, y: 210 },
        { x: 120, y: 320 }, { x: 280, y: 340 }, { x: 420, y: 350 }, { x: 580, y: 330 }, { x: 720, y: 310 }
    ];

    positions.forEach((pos, i) => {
        nodes.push(new NetworkNode(i, pos.x, pos.y));
    });

    // 创建连接
    const connectionPairs = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
        [5, 6], [6, 7], [7, 8], [8, 9],
        [5, 10], [6, 11], [7, 12], [8, 13], [9, 14],
        [10, 11], [11, 12], [12, 13], [13, 14],
        [0, 6], [2, 8], [4, 8], [6, 12], [8, 12]
    ];

    connectionPairs.forEach(([a, b]) => {
        nodes[a].neighbors.push(b);
        nodes[b].neighbors.push(a);
        connections.push([a, b]);
    });

    updatePropagationStats();
}

function drawConnections() {
    connections.forEach(([a, b]) => {
        const nodeA = nodes[a];
        const nodeB = nodes[b];
        const bothReceived = propagationState.receivedNodes.has(a) && propagationState.receivedNodes.has(b);

        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.strokeStyle = bothReceived ? COLORS.connectionActive : COLORS.connection;
        ctx.lineWidth = bothReceived ? 3 : 2;
        ctx.stroke();
    });
}

function render() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    nodes.forEach(node => {
        node.update();
        node.draw();
    });
    requestAnimationFrame(render);
}

function updatePropagationStats() {
    const totalEl = document.getElementById('total-nodes');
    const receivedEl = document.getElementById('received-nodes');
    const progressEl = document.getElementById('propagation-progress');
    const hopsEl = document.getElementById('propagation-hops');

    if (totalEl) totalEl.textContent = nodes.length;
    if (receivedEl) receivedEl.textContent = propagationState.receivedNodes.size;
    if (progressEl) {
        const progress = nodes.length > 0 ? Math.round((propagationState.receivedNodes.size / nodes.length) * 100) : 0;
        progressEl.textContent = progress + '%';
    }
    if (hopsEl) hopsEl.textContent = propagationState.currentHop;
}

function startPropagation() {
    if (propagationState.active || nodes.length === 0) return;

    // 随机选择源节点
    const sourceIndex = Math.floor(Math.random() * nodes.length);
    propagationState.sourceNode = sourceIndex;
    propagationState.active = true;
    propagationState.receivedNodes.clear();
    propagationState.currentHop = 0;

    // 重置所有节点
    nodes.forEach(node => {
        node.state = 'waiting';
    });

    // 设置源节点
    nodes[sourceIndex].state = 'source';
    nodes[sourceIndex].pulse();
    propagationState.receivedNodes.add(sourceIndex);

    const speedSlider = document.getElementById('propagation-speed');
    const speed = speedSlider ? (6 - parseInt(speedSlider.value)) * 200 : 600;

    // BFS 传播
    let currentLevel = [sourceIndex];

    function propagateLevel() {
        if (currentLevel.length === 0) {
            propagationState.active = false;
            return;
        }

        propagationState.currentHop++;
        const nextLevel = [];

        currentLevel.forEach(nodeIndex => {
            nodes[nodeIndex].neighbors.forEach(neighborIndex => {
                if (!propagationState.receivedNodes.has(neighborIndex)) {
                    propagationState.receivedNodes.add(neighborIndex);
                    nodes[neighborIndex].state = 'received';
                    nodes[neighborIndex].pulse();
                    nextLevel.push(neighborIndex);
                }
            });
        });

        updatePropagationStats();
        currentLevel = nextLevel;

        if (nextLevel.length > 0) {
            setTimeout(propagateLevel, speed);
        } else {
            propagationState.active = false;
        }
    }

    updatePropagationStats();
    setTimeout(propagateLevel, speed);
}

function resetPropagation() {
    propagationState.active = false;
    propagationState.receivedNodes.clear();
    propagationState.currentHop = 0;
    nodes.forEach(node => {
        node.state = 'waiting';
        node.pulseAlpha = 0;
    });
    updatePropagationStats();
}

// ==========================================
// 分叉演示
// ==========================================
let forkState = {
    triggered: false,
    resolved: false,
    winner: null
};

function triggerFork() {
    if (forkState.triggered) return;

    forkState.triggered = true;
    const forkPoint = document.getElementById('fork-point');
    const explanation = document.getElementById('fork-explanation');
    const status = document.getElementById('fork-status');
    const resolveA = document.getElementById('resolve-fork-a');
    const resolveB = document.getElementById('resolve-fork-b');

    if (forkPoint) forkPoint.classList.add('active');
    if (explanation) explanation.style.display = 'block';
    if (status) status.innerHTML = '<div class="status-message warning">⚠️ 分叉发生！网络暂时分裂成两条链</div>';
    if (resolveA) resolveA.disabled = false;
    if (resolveB) resolveB.disabled = false;

    // 动画显示分叉
    const branchA = document.getElementById('branch-a');
    const branchB = document.getElementById('branch-b');

    if (branchA) {
        branchA.style.opacity = '0';
        branchA.style.display = 'flex';
        setTimeout(() => { branchA.style.opacity = '1'; }, 100);
    }
    if (branchB) {
        branchB.style.opacity = '0';
        branchB.style.display = 'flex';
        setTimeout(() => { branchB.style.opacity = '1'; }, 300);
    }
}

function resolveFork(winner) {
    if (!forkState.triggered || forkState.resolved) return;

    forkState.resolved = true;
    forkState.winner = winner;

    const status = document.getElementById('fork-status');
    const resolveA = document.getElementById('resolve-fork-a');
    const resolveB = document.getElementById('resolve-fork-b');
    const branchA = document.getElementById('branch-a');
    const branchB = document.getElementById('branch-b');
    const block4a = document.getElementById('block-4a');
    const block4b = document.getElementById('block-4b');

    if (resolveA) resolveA.disabled = true;
    if (resolveB) resolveB.disabled = true;

    if (winner === 'a') {
        // 矿工A赢得竞争
        if (status) status.innerHTML = '<div class="status-message success">✅ 矿工A找到新区块！链A成为最长链，链B的区块#4B成为孤块</div>';

        // 添加新区块到链A
        if (branchA) {
            const newBlock = document.createElement('div');
            newBlock.className = 'chain-block fork-block block-a new-block';
            newBlock.innerHTML = '<span class="block-label">#5A</span>';
            const arrow = document.createElement('div');
            arrow.className = 'chain-arrow';
            arrow.textContent = '→';
            branchA.appendChild(arrow);
            branchA.appendChild(newBlock);
        }

        // 标记链B为孤块
        if (branchB) branchB.classList.add('orphaned');
        if (block4b) block4b.classList.add('orphan');

    } else {
        // 矿工B赢得竞争
        if (status) status.innerHTML = '<div class="status-message success">✅ 矿工B找到新区块！链B成为最长链，链A的区块#4A成为孤块</div>';

        // 添加新区块到链B
        if (branchB) {
            const newBlock = document.createElement('div');
            newBlock.className = 'chain-block fork-block block-b new-block';
            newBlock.innerHTML = '<span class="block-label">#5B</span>';
            const arrow = document.createElement('div');
            arrow.className = 'chain-arrow';
            arrow.textContent = '→';
            branchB.appendChild(arrow);
            branchB.appendChild(newBlock);
        }

        // 标记链A为孤块
        if (branchA) branchA.classList.add('orphaned');
        if (block4a) block4a.classList.add('orphan');
    }
}

function resetFork() {
    forkState = { triggered: false, resolved: false, winner: null };

    const forkPoint = document.getElementById('fork-point');
    const explanation = document.getElementById('fork-explanation');
    const status = document.getElementById('fork-status');
    const resolveA = document.getElementById('resolve-fork-a');
    const resolveB = document.getElementById('resolve-fork-b');
    const branchA = document.getElementById('branch-a');
    const branchB = document.getElementById('branch-b');

    if (forkPoint) forkPoint.classList.remove('active');
    if (explanation) explanation.style.display = 'none';
    if (status) status.innerHTML = '<div class="status-message">点击"触发分叉"观看演示</div>';
    if (resolveA) resolveA.disabled = true;
    if (resolveB) resolveB.disabled = true;

    // 重置分叉分支
    if (branchA) {
        branchA.classList.remove('orphaned');
        branchA.style.display = 'none';
        branchA.innerHTML = `
            <div class="chain-arrow">→</div>
            <div class="chain-block fork-block block-a" id="block-4a">
                <span class="block-label">#4A</span>
                <span class="block-miner">矿工 A</span>
            </div>
        `;
    }
    if (branchB) {
        branchB.classList.remove('orphaned');
        branchB.style.display = 'none';
        branchB.innerHTML = `
            <div class="chain-arrow">→</div>
            <div class="chain-block fork-block block-b" id="block-4b">
                <span class="block-label">#4B</span>
                <span class="block-miner">矿工 B</span>
            </div>
        `;
    }
}

// ==========================================
// 共识收敛演示
// ==========================================
let convergenceState = {
    step: 0,
    maxSteps: 4,
    running: false,
    chainALength: 4,
    chainBLength: 4,
    nodeChains: {}
};

function updateConvergenceDisplay() {
    const chainALengthEl = document.getElementById('chain-a-length');
    const chainBLengthEl = document.getElementById('chain-b-length');
    const chainANodesEl = document.getElementById('chain-a-nodes');
    const chainBNodesEl = document.getElementById('chain-b-nodes');

    if (chainALengthEl) chainALengthEl.textContent = convergenceState.chainALength;
    if (chainBLengthEl) chainBLengthEl.textContent = convergenceState.chainBLength;

    let aCount = 0, bCount = 0;
    Object.values(convergenceState.nodeChains).forEach(chain => {
        if (chain === 'a') aCount++;
        if (chain === 'b') bCount++;
    });

    if (chainANodesEl) chainANodesEl.textContent = aCount;
    if (chainBNodesEl) chainBNodesEl.textContent = bCount;

    // 更新节点显示
    for (let i = 1; i <= 6; i++) {
        const nodeEl = document.getElementById(`node-${i}`);
        if (nodeEl) {
            const chain = convergenceState.nodeChains[i] || 'none';
            nodeEl.dataset.chain = chain;
            const chainLabel = nodeEl.querySelector('.node-chain');
            if (chainLabel) {
                if (chain === 'a') chainLabel.textContent = '链A';
                else if (chain === 'b') chainLabel.textContent = '链B';
                else chainLabel.textContent = '';
            }
        }
    }

    // 更新时间线
    document.querySelectorAll('.timeline-step').forEach(el => {
        const step = parseInt(el.dataset.step);
        const marker = el.querySelector('.step-marker');
        if (marker) {
            marker.classList.toggle('active', step <= convergenceState.step);
            marker.classList.toggle('current', step === convergenceState.step);
        }
    });
}

function updateMiniChains() {
    const miniChainA = document.getElementById('mini-chain-a');
    const miniChainB = document.getElementById('mini-chain-b');

    if (miniChainA) {
        let html = '<span class="mini-block">3</span><span class="mini-arrow">→</span><span class="mini-block highlight-a">4A</span>';
        if (convergenceState.chainALength > 4) {
            html += '<span class="mini-arrow">→</span><span class="mini-block highlight-a new">5A</span>';
        }
        miniChainA.innerHTML = html;
    }

    if (miniChainB) {
        let html = '<span class="mini-block">3</span><span class="mini-arrow">→</span><span class="mini-block highlight-b">4B</span>';
        if (convergenceState.chainBLength > 4) {
            html += '<span class="mini-arrow">→</span><span class="mini-block highlight-b new">5B</span>';
        }
        miniChainB.innerHTML = html;
    }

    // 标记获胜的链
    const chainASide = document.querySelector('.chain-a-side');
    const chainBSide = document.querySelector('.chain-b-side');

    if (chainASide) {
        chainASide.classList.toggle('winner', convergenceState.chainALength > convergenceState.chainBLength);
        chainASide.classList.toggle('loser', convergenceState.chainALength < convergenceState.chainBLength);
    }
    if (chainBSide) {
        chainBSide.classList.toggle('winner', convergenceState.chainBLength > convergenceState.chainALength);
        chainBSide.classList.toggle('loser', convergenceState.chainBLength < convergenceState.chainALength);
    }
}

function setConvergenceMessage(msg) {
    const el = document.getElementById('convergence-message');
    if (el) el.textContent = msg;
}

function runConvergenceStep() {
    const stepBtn = document.getElementById('step-convergence');

    switch (convergenceState.step) {
        case 0:
            // 初始状态
            setConvergenceMessage('所有节点都在区块#3上，准备接收新区块...');
            convergenceState.nodeChains = {};
            break;

        case 1:
            // 分叉传播 - 节点随机接收不同的区块
            setConvergenceMessage('矿工A和B同时发现区块，节点根据网络延迟接收不同的区块...');
            convergenceState.nodeChains = {
                1: 'a', 2: 'a', 3: 'b',
                4: 'b', 5: 'a', 6: 'b'
            };
            break;

        case 2:
            // 新区块产生 - 链A变长
            setConvergenceMessage('矿工A率先在链A上挖出新区块#5A，链A现在更长！');
            convergenceState.chainALength = 5;
            updateMiniChains();
            break;

        case 3:
            // 共识收敛 - 所有节点切换到最长链
            setConvergenceMessage('✅ 所有节点检测到链A更长，自动切换到链A。共识达成！');
            convergenceState.nodeChains = {
                1: 'a', 2: 'a', 3: 'a',
                4: 'a', 5: 'a', 6: 'a'
            };
            if (stepBtn) stepBtn.disabled = true;
            break;
    }

    updateConvergenceDisplay();
    updateMiniChains();

    convergenceState.step++;
    if (convergenceState.step >= convergenceState.maxSteps) {
        convergenceState.running = false;
    }
}

function startConvergence() {
    if (convergenceState.running) return;

    resetConvergence();
    convergenceState.running = true;

    const stepBtn = document.getElementById('step-convergence');
    const startBtn = document.getElementById('start-convergence');

    if (stepBtn) stepBtn.disabled = false;
    if (startBtn) startBtn.disabled = true;

    runConvergenceStep();
}

function stepConvergence() {
    if (convergenceState.step < convergenceState.maxSteps) {
        runConvergenceStep();
    }
}

function resetConvergence() {
    convergenceState = {
        step: 0,
        maxSteps: 4,
        running: false,
        chainALength: 4,
        chainBLength: 4,
        nodeChains: {}
    };

    const stepBtn = document.getElementById('step-convergence');
    const startBtn = document.getElementById('start-convergence');

    if (stepBtn) stepBtn.disabled = true;
    if (startBtn) startBtn.disabled = false;

    setConvergenceMessage('点击"开始演示"观察共识如何形成');
    updateConvergenceDisplay();
    updateMiniChains();

    // 重置样式
    document.querySelector('.chain-a-side')?.classList.remove('winner', 'loser');
    document.querySelector('.chain-b-side')?.classList.remove('winner', 'loser');
}

// ==========================================
// 事件绑定
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 区块传播
    const startPropBtn = document.getElementById('start-propagation');
    const resetPropBtn = document.getElementById('reset-propagation');

    if (startPropBtn) startPropBtn.addEventListener('click', startPropagation);
    if (resetPropBtn) resetPropBtn.addEventListener('click', resetPropagation);

    // 分叉演示
    const triggerForkBtn = document.getElementById('trigger-fork');
    const resolveABtn = document.getElementById('resolve-fork-a');
    const resolveBBtn = document.getElementById('resolve-fork-b');
    const resetForkBtn = document.getElementById('reset-fork');

    if (triggerForkBtn) triggerForkBtn.addEventListener('click', triggerFork);
    if (resolveABtn) resolveABtn.addEventListener('click', () => resolveFork('a'));
    if (resolveBBtn) resolveBBtn.addEventListener('click', () => resolveFork('b'));
    if (resetForkBtn) resetForkBtn.addEventListener('click', resetFork);

    // 共识收敛
    const startConvBtn = document.getElementById('start-convergence');
    const stepConvBtn = document.getElementById('step-convergence');
    const resetConvBtn = document.getElementById('reset-convergence');

    if (startConvBtn) startConvBtn.addEventListener('click', startConvergence);
    if (stepConvBtn) stepConvBtn.addEventListener('click', stepConvergence);
    if (resetConvBtn) resetConvBtn.addEventListener('click', resetConvergence);

    // 初始化
    initNetwork();
    if (ctx) render();
    resetFork();
    resetConvergence();
});
