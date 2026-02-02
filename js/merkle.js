// ==========================================
// Merkle Tree 演示
// ==========================================

// SHA-256 哈希函数 (简化版，复用 hash.js 的逻辑)
function sha256(message) {
    function utf8Encode(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 128) bytes.push(c);
            else if (c < 2048) {
                bytes.push((c >> 6) | 192);
                bytes.push((c & 63) | 128);
            } else if (c < 65536) {
                bytes.push((c >> 12) | 224);
                bytes.push(((c >> 6) & 63) | 128);
                bytes.push((c & 63) | 128);
            }
        }
        return bytes;
    }

    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

    const k = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    const bytes = utf8Encode(message);
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);

    const highBits = Math.floor(bitLength / 0x100000000);
    const lowBits = bitLength >>> 0;
    for (let i = 3; i >= 0; i--) bytes.push((highBits >>> (i * 8)) & 0xff);
    for (let i = 3; i >= 0; i--) bytes.push((lowBits >>> (i * 8)) & 0xff);

    for (let chunk = 0; chunk < bytes.length; chunk += 64) {
        const w = new Array(64);
        for (let i = 0; i < 16; i++) {
            w[i] = (bytes[chunk + i * 4] << 24) | (bytes[chunk + i * 4 + 1] << 16) |
                   (bytes[chunk + i * 4 + 2] << 8) | (bytes[chunk + i * 4 + 3]);
        }
        for (let i = 16; i < 64; i++) {
            const s0 = rightRotate(w[i-15], 7) ^ rightRotate(w[i-15], 18) ^ (w[i-15] >>> 3);
            const s1 = rightRotate(w[i-2], 17) ^ rightRotate(w[i-2], 19) ^ (w[i-2] >>> 10);
            w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
        }

        let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
        for (let i = 0; i < 64; i++) {
            const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + k[i] + w[i]) | 0;
            const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) | 0;
            h = g; g = f; f = e; e = (d + temp1) | 0;
            d = c; c = b; b = a; a = (temp1 + temp2) | 0;
        }

        h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
        h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
    }

    function toHex(n) { return ('00000000' + (n >>> 0).toString(16)).slice(-8); }
    return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

// 全局状态
let merkleTree = null;
let transactions = [];

// 构建 Merkle Tree
function buildMerkleTree(txList) {
    if (txList.length === 0) return null;

    // 叶子节点层
    let currentLevel = txList.map((tx, index) => ({
        hash: sha256(tx),
        label: tx,
        index: index,
        isLeaf: true
    }));

    const levels = [currentLevel];

    // 逐层向上构建
    while (currentLevel.length > 1) {
        const nextLevel = [];

        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            // 如果是奇数，复制最后一个
            const right = currentLevel[i + 1] || currentLevel[i];

            const combinedHash = sha256(left.hash + right.hash);
            nextLevel.push({
                hash: combinedHash,
                left: left,
                right: right,
                isLeaf: false
            });
        }

        levels.push(nextLevel);
        currentLevel = nextLevel;
    }

    return {
        root: currentLevel[0],
        levels: levels
    };
}

// 渲染 Merkle Tree
function renderMerkleTree(tree, containerId) {
    const container = document.getElementById(containerId);
    if (!tree) {
        container.innerHTML = '<div class="merkle-placeholder">No tree to display</div>';
        return;
    }

    container.innerHTML = '';

    // 从顶层到底层渲染
    const reversedLevels = [...tree.levels].reverse();

    reversedLevels.forEach((level, levelIndex) => {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'merkle-level';

        const isRoot = levelIndex === 0;
        const isLeaf = levelIndex === reversedLevels.length - 1;

        if (isRoot) {
            levelDiv.classList.add('root-level');
        }
        if (isLeaf) {
            levelDiv.classList.add('leaf-level');
        }

        level.forEach((node, nodeIndex) => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'merkle-node';
            nodeDiv.dataset.hash = node.hash;

            if (isRoot) {
                nodeDiv.classList.add('root-node');
            }
            if (node.isLeaf) {
                nodeDiv.classList.add('leaf-node');
                nodeDiv.dataset.index = node.index;
            }

            const labelSpan = document.createElement('span');
            labelSpan.className = 'node-label';
            if (node.isLeaf) {
                labelSpan.textContent = node.label;
            } else if (isRoot) {
                labelSpan.textContent = 'Root';
            } else {
                labelSpan.textContent = `H${levelIndex}-${nodeIndex}`;
            }

            const hashSpan = document.createElement('span');
            hashSpan.className = 'node-hash';
            hashSpan.textContent = node.hash.substring(0, 8) + '...';
            hashSpan.title = node.hash;

            nodeDiv.appendChild(labelSpan);
            nodeDiv.appendChild(hashSpan);
            levelDiv.appendChild(nodeDiv);
        });

        container.appendChild(levelDiv);

        // 添加连接线（除了最后一层）
        if (levelIndex < reversedLevels.length - 1) {
            const connectorDiv = document.createElement('div');
            connectorDiv.className = 'merkle-connectors';
            connectorDiv.innerHTML = '<span class="connector-arrow">↑</span>'.repeat(level.length);
            container.appendChild(connectorDiv);
        }
    });
}

// 获取 Merkle Proof
function getMerkleProof(tree, txIndex) {
    if (!tree || txIndex < 0 || txIndex >= tree.levels[0].length) {
        return null;
    }

    const proof = [];
    let currentIndex = txIndex;

    for (let level = 0; level < tree.levels.length - 1; level++) {
        const currentLevel = tree.levels[level];
        const isLeft = currentIndex % 2 === 0;
        const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;

        // 处理奇数情况
        const sibling = siblingIndex < currentLevel.length
            ? currentLevel[siblingIndex]
            : currentLevel[currentIndex];

        proof.push({
            hash: sibling.hash,
            position: isLeft ? 'right' : 'left',
            siblingIndex: siblingIndex < currentLevel.length ? siblingIndex : currentIndex
        });

        currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
}

// 渲染证明路径
function renderProof(tree, txIndex, proof) {
    const container = document.getElementById('proof-visual');
    const detailsContainer = document.getElementById('proof-details');
    const pathContainer = document.getElementById('proof-path');
    const calcContainer = document.getElementById('proof-calc');

    if (!proof) {
        container.innerHTML = '<div class="proof-placeholder">无法生成证明</div>';
        detailsContainer.style.display = 'none';
        return;
    }

    // 高亮树中的路径
    const allNodes = document.querySelectorAll('.merkle-node');
    allNodes.forEach(node => {
        node.classList.remove('in-proof', 'proof-sibling', 'proof-target');
    });

    // 高亮目标交易
    const targetNode = document.querySelector(`.merkle-node[data-index="${txIndex}"]`);
    if (targetNode) {
        targetNode.classList.add('proof-target');
    }

    // 高亮证明路径中的兄弟节点
    let currentHash = tree.levels[0][txIndex].hash;
    proof.forEach((step, idx) => {
        // 找到并高亮兄弟节点
        const siblingNodes = document.querySelectorAll(`.merkle-node[data-hash="${step.hash}"]`);
        siblingNodes.forEach(node => node.classList.add('proof-sibling'));
    });

    // 高亮根节点
    const rootNode = document.querySelector('.root-node');
    if (rootNode) {
        rootNode.classList.add('in-proof');
    }

    // 显示证明详情
    detailsContainer.style.display = 'block';

    // 渲染证明路径
    const tx = transactions[txIndex];
    let pathHtml = `<div class="proof-step proof-start">
        <span class="step-label">Target:</span>
        <span class="step-value">${tx}</span>
        <span class="step-hash">${tree.levels[0][txIndex].hash.substring(0, 16)}...</span>
    </div>`;

    proof.forEach((step, idx) => {
        pathHtml += `<div class="proof-step">
            <span class="step-label">+ ${step.position === 'left' ? 'Left' : 'Right'}:</span>
            <span class="step-hash">${step.hash.substring(0, 16)}...</span>
        </div>`;
    });

    pathHtml += `<div class="proof-step proof-end">
        <span class="step-label">= Root:</span>
        <span class="step-hash">${tree.root.hash.substring(0, 16)}...</span>
    </div>`;

    pathContainer.innerHTML = pathHtml;

    // 渲染计算过程
    let calcHtml = '<div class="calc-steps">';
    currentHash = tree.levels[0][txIndex].hash;

    proof.forEach((step, idx) => {
        const leftHash = step.position === 'left' ? step.hash : currentHash;
        const rightHash = step.position === 'left' ? currentHash : step.hash;
        const newHash = sha256(leftHash + rightHash);

        calcHtml += `<div class="calc-step">
            <div class="calc-formula">
                <span class="calc-fn">SHA256(</span>
                <span class="calc-left ${step.position === 'left' ? 'sibling' : 'current'}">${leftHash.substring(0, 8)}...</span>
                <span class="calc-concat"> + </span>
                <span class="calc-right ${step.position === 'right' ? 'sibling' : 'current'}">${rightHash.substring(0, 8)}...</span>
                <span class="calc-fn">)</span>
            </div>
            <div class="calc-result">= ${newHash.substring(0, 16)}...</div>
        </div>`;

        currentHash = newHash;
    });

    calcHtml += '</div>';
    calcContainer.innerHTML = calcHtml;
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    const txsInput = document.getElementById('merkle-txs');
    const buildBtn = document.getElementById('build-tree-btn');
    const verifySelect = document.getElementById('verify-tx-select');
    const verifyBtn = document.getElementById('verify-btn');

    // 构建树按钮
    buildBtn.addEventListener('click', function() {
        const txText = txsInput.value.trim();
        transactions = txText.split('\n').filter(tx => tx.trim() !== '');

        if (transactions.length === 0) {
            alert('请输入至少一个交易');
            return;
        }

        merkleTree = buildMerkleTree(transactions);
        renderMerkleTree(merkleTree, 'merkle-tree');

        // 更新验证选择框
        verifySelect.innerHTML = '';
        transactions.forEach((tx, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.textContent = `${tx} (${merkleTree.levels[0][idx].hash.substring(0, 8)}...)`;
            verifySelect.appendChild(option);
        });

        verifyBtn.disabled = false;

        // 重置证明显示
        document.getElementById('proof-visual').innerHTML = '<div class="proof-placeholder">选择交易后点击按钮查看证明路径...</div>';
        document.getElementById('proof-details').style.display = 'none';
    });

    // 验证按钮
    verifyBtn.addEventListener('click', function() {
        const txIndex = parseInt(verifySelect.value);
        if (isNaN(txIndex) || !merkleTree) return;

        const proof = getMerkleProof(merkleTree, txIndex);
        renderProof(merkleTree, txIndex, proof);
    });
});
