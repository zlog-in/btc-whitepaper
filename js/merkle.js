// ==========================================
// Merkle Tree 演示
// ==========================================

// SHA-256 哈希函数
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
let animationTimer = null;

// 构建 Merkle Tree (返回构建步骤用于动画)
function buildMerkleTree(txList) {
    if (txList.length === 0) return null;

    const buildSteps = []; // 记录每一步的构建过程

    // 叶子节点层
    let currentLevel = txList.map((tx, index) => ({
        hash: sha256(tx),
        label: tx,
        index: index,
        isLeaf: true,
        isDuplicate: false,
        id: `leaf-${index}`
    }));

    const levels = [currentLevel];
    buildSteps.push({
        type: 'leaves',
        nodes: currentLevel.map(n => ({ ...n }))
    });

    // 逐层向上构建
    let levelNum = 0;
    while (currentLevel.length > 1) {
        const nextLevel = [];
        // 如果当前层节点数为奇数，添加虚拟复制节点
        let levelWithDuplicates = [...currentLevel];
        let duplicateNode = null;

        if (currentLevel.length % 2 === 1) {
            const lastNode = currentLevel[currentLevel.length - 1];
            duplicateNode = {
                ...lastNode,
                id: `${lastNode.id}-dup`,
                isDuplicate: true,
                originalId: lastNode.id,
                label: lastNode.isLeaf ? `${lastNode.label} (复制)` : `${lastNode.label || 'H'} (复制)`
            };
            levelWithDuplicates.push(duplicateNode);

            // 记录复制步骤
            buildSteps.push({
                type: 'duplicate',
                originalNode: { ...lastNode },
                duplicateNode: { ...duplicateNode },
                levelIndex: levelNum
            });
        }

        for (let i = 0; i < levelWithDuplicates.length; i += 2) {
            const left = levelWithDuplicates[i];
            const right = levelWithDuplicates[i + 1];

            const combinedHash = sha256(left.hash + right.hash);
            const parentNode = {
                hash: combinedHash,
                left: left,
                right: right,
                leftId: left.id,
                rightId: right.id,
                isLeaf: false,
                isDuplicate: false,
                id: `node-${levelNum + 1}-${nextLevel.length}`
            };
            nextLevel.push(parentNode);

            // 记录构建步骤
            buildSteps.push({
                type: 'combine',
                leftNode: { ...left },
                rightNode: { ...right },
                parentNode: { ...parentNode },
                hasDuplicate: right.isDuplicate
            });
        }

        // 保存包含复制节点的层级用于渲染
        levels[levelNum] = levelWithDuplicates;
        levels.push(nextLevel);
        currentLevel = nextLevel;
        levelNum++;
    }

    return {
        root: currentLevel[0],
        levels: levels,
        buildSteps: buildSteps
    };
}

// 渲染静态树结构
function renderMerkleTree(tree, containerId, animated = true) {
    const container = document.getElementById(containerId);
    if (!tree) {
        container.innerHTML = '<div class="merkle-placeholder">No tree to display</div>';
        return;
    }

    container.innerHTML = '';

    // 计算布局
    const nodeWidth = 90;
    const nodeHeight = 50;
    const levelGap = 80;
    const nodeGap = 20;

    const totalLevels = tree.levels.length;
    const maxNodesInLevel = tree.levels[0].length;
    const totalWidth = maxNodesInLevel * nodeWidth + (maxNodesInLevel - 1) * nodeGap;
    const totalHeight = totalLevels * nodeHeight + (totalLevels - 1) * levelGap;

    // 创建 SVG 容器
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", Math.max(totalWidth + 40, 400));
    svg.setAttribute("height", totalHeight + 60);
    svg.setAttribute("class", "merkle-svg");

    // 连接线组 (放在节点下面)
    const linesGroup = document.createElementNS(svgNS, "g");
    linesGroup.setAttribute("class", "merkle-lines");
    svg.appendChild(linesGroup);

    // 节点组
    const nodesGroup = document.createElementNS(svgNS, "g");
    nodesGroup.setAttribute("class", "merkle-nodes");
    svg.appendChild(nodesGroup);

    // 计算每个节点的位置
    const nodePositions = {};

    // 从底层到顶层渲染 (levels[0] 是叶子层)
    tree.levels.forEach((level, levelIndex) => {
        const y = totalHeight - levelIndex * (nodeHeight + levelGap) - nodeHeight / 2 + 20;
        const levelWidth = level.length * nodeWidth + (level.length - 1) * nodeGap;
        const startX = (Math.max(totalWidth + 40, 400) - levelWidth) / 2;

        level.forEach((node, nodeIndex) => {
            const x = startX + nodeIndex * (nodeWidth + nodeGap) + nodeWidth / 2;
            nodePositions[node.id] = { x, y, node };

            // 创建节点组
            const nodeGroup = document.createElementNS(svgNS, "g");
            nodeGroup.setAttribute("class", "merkle-node-group");
            nodeGroup.setAttribute("data-id", node.id);
            nodeGroup.setAttribute("transform", `translate(${x}, ${y})`);
            if (animated) {
                nodeGroup.style.opacity = "0";
            }

            // 节点背景
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", -nodeWidth / 2);
            rect.setAttribute("y", -nodeHeight / 2);
            rect.setAttribute("width", nodeWidth);
            rect.setAttribute("height", nodeHeight);
            rect.setAttribute("rx", "6");

            // 设置节点样式类
            let rectClass = "node-rect";
            if (node.isDuplicate) {
                rectClass += " duplicate";
            } else if (node.isLeaf) {
                rectClass += " leaf";
            } else if (levelIndex === tree.levels.length - 1) {
                rectClass += " root";
            }
            rect.setAttribute("class", rectClass);
            nodeGroup.appendChild(rect);

            // 节点标签
            const label = document.createElementNS(svgNS, "text");
            label.setAttribute("class", node.isDuplicate ? "node-label duplicate-label" : "node-label");
            label.setAttribute("y", "-8");

            let labelText;
            if (node.isDuplicate) {
                // 复制节点显示 "复制" 标签
                labelText = "复制";
            } else if (node.isLeaf) {
                labelText = node.label;
            } else if (levelIndex === tree.levels.length - 1) {
                labelText = "Root";
            } else {
                labelText = `H${levelIndex}`;
            }
            label.textContent = labelText;
            nodeGroup.appendChild(label);

            // 哈希值
            const hashText = document.createElementNS(svgNS, "text");
            hashText.setAttribute("class", "node-hash");
            hashText.setAttribute("y", "12");
            hashText.textContent = node.hash.substring(0, 8) + "...";
            nodeGroup.appendChild(hashText);

            nodesGroup.appendChild(nodeGroup);
        });
    });

    // 绘制连接线
    tree.levels.forEach((level, levelIndex) => {
        if (levelIndex === 0) return; // 叶子层没有子节点

        level.forEach((node) => {
            const parentPos = nodePositions[node.id];
            const leftPos = nodePositions[node.leftId];
            const rightPos = nodePositions[node.rightId];

            if (leftPos) {
                const line = document.createElementNS(svgNS, "line");
                line.setAttribute("x1", parentPos.x);
                line.setAttribute("y1", parentPos.y + nodeHeight / 2);
                line.setAttribute("x2", leftPos.x);
                line.setAttribute("y2", leftPos.y - nodeHeight / 2);
                line.setAttribute("class", "tree-line");
                line.setAttribute("data-parent", node.id);
                line.setAttribute("data-child", node.leftId);
                if (animated) {
                    line.style.opacity = "0";
                }
                linesGroup.appendChild(line);
            }

            if (rightPos && node.leftId !== node.rightId) {
                const line = document.createElementNS(svgNS, "line");
                line.setAttribute("x1", parentPos.x);
                line.setAttribute("y1", parentPos.y + nodeHeight / 2);
                line.setAttribute("x2", rightPos.x);
                line.setAttribute("y2", rightPos.y - nodeHeight / 2);
                line.setAttribute("class", "tree-line");
                line.setAttribute("data-parent", node.id);
                line.setAttribute("data-child", node.rightId);
                if (animated) {
                    line.style.opacity = "0";
                }
                linesGroup.appendChild(line);
            }
        });
    });

    container.appendChild(svg);

    // 添加计算过程显示区域
    const calcDisplay = document.createElement('div');
    calcDisplay.className = 'merkle-calc-display';
    calcDisplay.id = 'merkle-calc-display';
    container.appendChild(calcDisplay);

    // 如果需要动画，开始动画
    if (animated) {
        animateBuild(tree, svg);
    }
}

// 动画展示构建过程
function animateBuild(tree, svg) {
    const calcDisplay = document.getElementById('merkle-calc-display');
    let stepIndex = 0;
    const steps = tree.buildSteps;
    const delay = 800;

    // 清除之前的动画
    if (animationTimer) {
        clearTimeout(animationTimer);
    }

    function showStep() {
        if (stepIndex >= steps.length) {
            calcDisplay.innerHTML = '<div class="calc-complete">✓ Merkle Tree 构建完成！根哈希: <code>' + tree.root.hash.substring(0, 16) + '...</code></div>';
            return;
        }

        const step = steps[stepIndex];

        if (step.type === 'leaves') {
            // 显示所有叶子节点
            step.nodes.forEach((node, i) => {
                setTimeout(() => {
                    const nodeGroup = svg.querySelector(`[data-id="${node.id}"]`);
                    if (nodeGroup) {
                        nodeGroup.style.transition = 'opacity 0.3s ease';
                        nodeGroup.style.opacity = '1';
                    }
                }, i * 150);
            });

            calcDisplay.innerHTML = `
                <div class="calc-step-info">
                    <span class="calc-step-num">步骤 1</span>
                    <span class="calc-step-desc">计算每个交易的哈希值，形成叶子节点</span>
                </div>
                <div class="calc-formula-list">
                    ${step.nodes.map(n => `<div class="calc-item"><span class="calc-input">${n.label}</span> → <span class="calc-output">${n.hash.substring(0, 12)}...</span></div>`).join('')}
                </div>
            `;

            stepIndex++;
            animationTimer = setTimeout(showStep, delay + step.nodes.length * 150);

        } else if (step.type === 'duplicate') {
            // 显示复制节点
            const originalGroup = svg.querySelector(`[data-id="${step.originalNode.id}"]`);
            const duplicateGroup = svg.querySelector(`[data-id="${step.duplicateNode.id}"]`);

            // 高亮原节点
            if (originalGroup) {
                originalGroup.querySelector('.node-rect').classList.add('highlight-left');
            }

            calcDisplay.innerHTML = `
                <div class="calc-step-info">
                    <span class="calc-step-num">步骤 ${stepIndex + 1}</span>
                    <span class="calc-step-desc">节点数为奇数，复制最后一个节点</span>
                </div>
                <div class="calc-duplicate">
                    <div class="duplicate-source">
                        <span class="source-label">原节点:</span>
                        <span class="source-hash">${step.originalNode.hash.substring(0, 12)}...</span>
                    </div>
                    <div class="duplicate-arrow">→ 复制</div>
                    <div class="duplicate-target">
                        <span class="target-label">虚拟节点:</span>
                        <span class="target-hash">${step.duplicateNode.hash.substring(0, 12)}...</span>
                    </div>
                </div>
            `;

            // 显示复制节点
            setTimeout(() => {
                if (duplicateGroup) {
                    duplicateGroup.style.transition = 'opacity 0.5s ease';
                    duplicateGroup.style.opacity = '1';
                    duplicateGroup.querySelector('.node-rect').classList.add('new-duplicate');
                }

                setTimeout(() => {
                    if (originalGroup) originalGroup.querySelector('.node-rect').classList.remove('highlight-left');
                    if (duplicateGroup) duplicateGroup.querySelector('.node-rect').classList.remove('new-duplicate');
                }, 500);
            }, 400);

            stepIndex++;
            animationTimer = setTimeout(showStep, delay + 600);

        } else if (step.type === 'combine') {
            // 高亮子节点
            const leftGroup = svg.querySelector(`[data-id="${step.leftNode.id}"]`);
            const rightGroup = svg.querySelector(`[data-id="${step.rightNode.id}"]`);
            const parentGroup = svg.querySelector(`[data-id="${step.parentNode.id}"]`);

            // 高亮子节点
            if (leftGroup) {
                leftGroup.querySelector('.node-rect').classList.add('highlight-left');
            }
            if (rightGroup) {
                rightGroup.querySelector('.node-rect').classList.add('highlight-right');
            }

            // 显示计算过程
            const levelNum = parseInt(step.parentNode.id.split('-')[1]) || 0;
            const rightLabel = step.hasDuplicate ? '(复制) ' + step.rightNode.hash.substring(0, 8) + '...' : step.rightNode.hash.substring(0, 10) + '...';
            calcDisplay.innerHTML = `
                <div class="calc-step-info">
                    <span class="calc-step-num">步骤 ${stepIndex + 1}</span>
                    <span class="calc-step-desc">合并节点计算父哈希${step.hasDuplicate ? ' (使用复制节点)' : ''}</span>
                </div>
                <div class="calc-combine">
                    <div class="calc-children">
                        <span class="child-hash left">${step.leftNode.hash.substring(0, 10)}...</span>
                        <span class="calc-plus">+</span>
                        <span class="child-hash right ${step.hasDuplicate ? 'duplicate' : ''}">${rightLabel}</span>
                    </div>
                    <div class="calc-arrow">↓ SHA256</div>
                    <div class="parent-hash">${step.parentNode.hash.substring(0, 16)}...</div>
                </div>
            `;

            // 延迟后显示父节点和连接线
            setTimeout(() => {
                // 显示连接线
                const lines = svg.querySelectorAll(`[data-parent="${step.parentNode.id}"]`);
                lines.forEach(line => {
                    line.style.transition = 'opacity 0.3s ease';
                    line.style.opacity = '1';
                });

                // 显示父节点
                if (parentGroup) {
                    parentGroup.style.transition = 'opacity 0.3s ease';
                    parentGroup.style.opacity = '1';
                    parentGroup.querySelector('.node-rect').classList.add('new-node');
                }

                // 移除高亮
                setTimeout(() => {
                    if (leftGroup) leftGroup.querySelector('.node-rect').classList.remove('highlight-left');
                    if (rightGroup) rightGroup.querySelector('.node-rect').classList.remove('highlight-right');
                    if (parentGroup) parentGroup.querySelector('.node-rect').classList.remove('new-node');
                }, 400);

            }, 500);

            stepIndex++;
            animationTimer = setTimeout(showStep, delay + 600);
        }
    }

    showStep();
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

        const sibling = siblingIndex < currentLevel.length
            ? currentLevel[siblingIndex]
            : currentLevel[currentIndex];

        proof.push({
            hash: sibling.hash,
            position: isLeft ? 'right' : 'left',
            siblingId: sibling.id,
            siblingIndex: siblingIndex < currentLevel.length ? siblingIndex : currentIndex
        });

        currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
}

// 渲染证明路径
function renderProof(tree, txIndex, proof) {
    const detailsContainer = document.getElementById('proof-details');
    const pathContainer = document.getElementById('proof-path');
    const calcContainer = document.getElementById('proof-calc');

    if (!proof) {
        detailsContainer.style.display = 'none';
        return;
    }

    // 清除之前的高亮
    const allRects = document.querySelectorAll('.merkle-svg .node-rect');
    allRects.forEach(rect => {
        rect.classList.remove('proof-target', 'proof-sibling', 'proof-path');
    });

    const allLines = document.querySelectorAll('.merkle-svg .tree-line');
    allLines.forEach(line => {
        line.classList.remove('proof-line');
    });

    // 高亮目标节点
    const targetNode = tree.levels[0][txIndex];
    const targetGroup = document.querySelector(`[data-id="${targetNode.id}"]`);
    if (targetGroup) {
        targetGroup.querySelector('.node-rect').classList.add('proof-target');
    }

    // 高亮证明路径
    proof.forEach(step => {
        const siblingGroup = document.querySelector(`[data-id="${step.siblingId}"]`);
        if (siblingGroup) {
            siblingGroup.querySelector('.node-rect').classList.add('proof-sibling');
        }
    });

    // 高亮根节点
    const rootNode = tree.levels[tree.levels.length - 1][0];
    const rootGroup = document.querySelector(`[data-id="${rootNode.id}"]`);
    if (rootGroup) {
        rootGroup.querySelector('.node-rect').classList.add('proof-path');
    }

    // 显示证明详情
    detailsContainer.style.display = 'block';

    // 渲染证明路径
    const tx = transactions[txIndex];
    let pathHtml = `
        <div class="proof-step proof-start">
            <span class="step-marker">●</span>
            <span class="step-label">验证目标:</span>
            <span class="step-value">${tx}</span>
            <span class="step-hash">${targetNode.hash.substring(0, 12)}...</span>
        </div>
    `;

    proof.forEach((step, idx) => {
        pathHtml += `
            <div class="proof-step">
                <span class="step-marker">○</span>
                <span class="step-label">兄弟节点 (${step.position === 'left' ? '左' : '右'}):</span>
                <span class="step-hash sibling-hash">${step.hash.substring(0, 12)}...</span>
            </div>
        `;
    });

    pathHtml += `
        <div class="proof-step proof-end">
            <span class="step-marker">★</span>
            <span class="step-label">Merkle Root:</span>
            <span class="step-hash root-hash">${tree.root.hash.substring(0, 12)}...</span>
        </div>
    `;

    pathContainer.innerHTML = pathHtml;

    // 渲染计算过程
    let calcHtml = '<div class="calc-verify-steps">';
    let currentHash = targetNode.hash;

    proof.forEach((step, idx) => {
        const leftHash = step.position === 'left' ? step.hash : currentHash;
        const rightHash = step.position === 'left' ? currentHash : step.hash;
        const newHash = sha256(leftHash + rightHash);

        calcHtml += `
            <div class="verify-step">
                <div class="verify-inputs">
                    <span class="hash-box ${step.position === 'left' ? 'sibling' : 'current'}">${leftHash.substring(0, 8)}...</span>
                    <span class="hash-plus">+</span>
                    <span class="hash-box ${step.position === 'right' ? 'sibling' : 'current'}">${rightHash.substring(0, 8)}...</span>
                </div>
                <div class="verify-arrow">↓ SHA256</div>
                <div class="verify-result">${newHash.substring(0, 12)}...</div>
            </div>
        `;

        currentHash = newHash;
    });

    calcHtml += '</div>';
    calcHtml += `<div class="verify-final ${currentHash === tree.root.hash ? 'success' : 'fail'}">
        ${currentHash === tree.root.hash ? '✓ 验证成功！哈希值匹配 Merkle Root' : '✗ 验证失败！哈希值不匹配'}
    </div>`;

    calcContainer.innerHTML = calcHtml;
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    const txsInput = document.getElementById('merkle-txs');
    const buildBtn = document.getElementById('build-tree-btn');
    const verifySelect = document.getElementById('verify-tx-select');
    const verifyBtn = document.getElementById('verify-btn');

    buildBtn.addEventListener('click', function() {
        const txText = txsInput.value.trim();
        transactions = txText.split('\n').filter(tx => tx.trim() !== '');

        if (transactions.length === 0) {
            alert('请输入至少一个交易');
            return;
        }

        if (transactions.length > 8) {
            alert('为了更好的展示效果，请输入不超过8个交易');
            return;
        }

        merkleTree = buildMerkleTree(transactions);
        renderMerkleTree(merkleTree, 'merkle-tree', true);

        // 更新验证选择框
        verifySelect.innerHTML = '';
        transactions.forEach((tx, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.textContent = `${tx}`;
            verifySelect.appendChild(option);
        });

        verifyBtn.disabled = false;

        // 重置证明显示
        document.getElementById('proof-details').style.display = 'none';
    });

    verifyBtn.addEventListener('click', function() {
        const txIndex = parseInt(verifySelect.value);
        if (isNaN(txIndex) || !merkleTree) return;

        const proof = getMerkleProof(merkleTree, txIndex);
        renderProof(merkleTree, txIndex, proof);
    });
});
