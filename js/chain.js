// ==========================================
// SHA-256 哈希函数
// ==========================================
function sha256(message) {
    function utf8Encode(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 128) bytes.push(c);
            else if (c < 2048) { bytes.push((c >> 6) | 192); bytes.push((c & 63) | 128); }
            else if (c < 65536) { bytes.push((c >> 12) | 224); bytes.push(((c >> 6) & 63) | 128); bytes.push((c & 63) | 128); }
            else { bytes.push((c >> 18) | 240); bytes.push(((c >> 12) & 63) | 128); bytes.push(((c >> 6) & 63) | 128); bytes.push((c & 63) | 128); }
        }
        return bytes;
    }
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const k = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];

    const bytes = utf8Encode(message);
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push((bitLength >>> (i * 8)) & 0xff);

    for (let chunk = 0; chunk < bytes.length; chunk += 64) {
        const w = new Array(64);
        for (let i = 0; i < 16; i++) w[i] = (bytes[chunk+i*4]<<24)|(bytes[chunk+i*4+1]<<16)|(bytes[chunk+i*4+2]<<8)|bytes[chunk+i*4+3];
        for (let i = 16; i < 64; i++) { const s0 = rightRotate(w[i-15],7)^rightRotate(w[i-15],18)^(w[i-15]>>>3); const s1 = rightRotate(w[i-2],17)^rightRotate(w[i-2],19)^(w[i-2]>>>10); w[i] = (w[i-16]+s0+w[i-7]+s1)|0; }
        let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;
        for (let i = 0; i < 64; i++) { const S1=rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25); const ch=(e&f)^(~e&g); const temp1=(h+S1+ch+k[i]+w[i])|0; const S0=rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22); const maj=(a&b)^(a&c)^(b&c); const temp2=(S0+maj)|0; h=g;g=f;f=e;e=(d+temp1)|0;d=c;c=b;b=a;a=(temp1+temp2)|0; }
        h0=(h0+a)|0;h1=(h1+b)|0;h2=(h2+c)|0;h3=(h3+d)|0;h4=(h4+e)|0;h5=(h5+f)|0;h6=(h6+g)|0;h7=(h7+h)|0;
    }
    function toHex(n) { return ('00000000'+(n>>>0).toString(16)).slice(-8); }
    return toHex(h0)+toHex(h1)+toHex(h2)+toHex(h3)+toHex(h4)+toHex(h5)+toHex(h6)+toHex(h7);
}

// ==========================================
// 区块链状态
// ==========================================
let chain = [];
const chainDifficulty = 2;
const chainTarget = '0'.repeat(chainDifficulty);

// 交易池数据
const sampleTransactions = [
    { from: 'Alice', to: 'Bob', amount: 0.5 },
    { from: 'Charlie', to: 'Dave', amount: 0.3 },
    { from: 'Eve', to: 'Frank', amount: 0.8 },
    { from: 'Grace', to: 'Henry', amount: 1.2 },
    { from: 'Ivan', to: 'Julia', amount: 0.15 },
    { from: 'Kevin', to: 'Linda', amount: 2.0 },
    { from: 'Mike', to: 'Nancy', amount: 0.45 },
    { from: 'Oscar', to: 'Paula', amount: 0.9 }
];

let txPoolIndex = 0;
let autoGrowthInterval = null;
let tamperedBlockIndex = null;

// ==========================================
// DOM 元素
// ==========================================
const blockchainVisual = document.getElementById('blockchain-visual');
const chainLengthEl = document.getElementById('chain-length');
const chainStatusEl = document.getElementById('chain-status');
const addBlockBtn = document.getElementById('add-block-btn');
const resetChainBtn = document.getElementById('reset-chain-btn');

// 增长演示元素
const startGrowthBtn = document.getElementById('start-growth-btn');
const autoGrowthBtn = document.getElementById('auto-growth-btn');
const resetGrowthBtn = document.getElementById('reset-growth-btn');
const txPool = document.getElementById('tx-pool');
const packPrevHash = document.getElementById('pack-prev-hash');
const packTxs = document.getElementById('pack-txs');
const packNonce = document.getElementById('pack-nonce');
const miningStatus = document.getElementById('mining-status');
const miningFill = document.getElementById('mining-fill');
const miningCurrentHash = document.getElementById('mining-current-hash');
const addedIndicator = document.getElementById('added-indicator');

// 篡改检测元素
const tamperExplanation = document.getElementById('tamper-explanation');
const tamperedBlockEl = document.getElementById('tampered-block');
const fixChainBtn = document.getElementById('fix-chain-btn');

// ==========================================
// 区块创建与挖矿
// ==========================================
function createChainBlock(index, prevHash, transactions = []) {
    return {
        index,
        prevHash,
        timestamp: new Date().toISOString(),
        transactions,
        data: transactions.map(tx => `${tx.from}→${tx.to}: ${tx.amount} BTC`).join('; ') || `区块 #${index}`,
        nonce: 0,
        hash: ''
    };
}

function calculateChainBlockHash(block) {
    const data = [block.prevHash, block.timestamp, block.data, block.nonce.toString()].join('|');
    return sha256(data);
}

function mineChainBlock(block, onProgress) {
    return new Promise((resolve) => {
        let nonce = 0;
        const mine = () => {
            const batchSize = 500;
            for (let i = 0; i < batchSize && nonce < 100000; i++, nonce++) {
                block.nonce = nonce;
                block.hash = calculateChainBlockHash(block);
                if (block.hash.startsWith(chainTarget)) {
                    if (onProgress) onProgress(nonce, block.hash, true);
                    resolve(block);
                    return;
                }
            }
            if (onProgress) onProgress(nonce, block.hash, false);
            if (nonce < 100000) {
                requestAnimationFrame(mine);
            } else {
                resolve(block);
            }
        };
        mine();
    });
}

function mineChainBlockSync(block) {
    let nonce = 0;
    while (nonce < 100000) {
        block.nonce = nonce;
        block.hash = calculateChainBlockHash(block);
        if (block.hash.startsWith(chainTarget)) return block;
        nonce++;
    }
    return block;
}

// ==========================================
// 验证区块链
// ==========================================
function validateChain() {
    for (let i = 0; i < chain.length; i++) {
        const block = chain[i];
        // 验证哈希
        if (!block.hash.startsWith(chainTarget)) {
            return { valid: false, invalidIndex: i, reason: 'hash' };
        }
        // 验证链接
        if (i > 0 && block.prevHash !== chain[i-1].hash) {
            return { valid: false, invalidIndex: i, reason: 'link' };
        }
    }
    return { valid: true };
}

// ==========================================
// 渲染区块链可视化
// ==========================================
function renderBlockchain() {
    blockchainVisual.innerHTML = '';
    const validation = validateChain();

    chain.forEach((block, i) => {
        // 链接箭头
        if (i > 0) {
            const link = document.createElement('div');
            link.className = 'chain-link-arrow';
            link.innerHTML = `
                <div class="link-line"></div>
                <div class="link-hash">${block.prevHash.slice(0, 8)}...</div>
            `;
            blockchainVisual.appendChild(link);
        }

        const isValid = validation.valid || i < validation.invalidIndex;
        const isTampered = !validation.valid && i >= validation.invalidIndex;

        const blockEl = document.createElement('div');
        blockEl.className = `visual-block ${isValid ? 'valid' : 'invalid'} ${i === chain.length - 1 ? 'latest' : ''}`;
        blockEl.innerHTML = `
            <div class="vblock-header">
                <span class="vblock-index">#${block.index}</span>
                <span class="vblock-status">${isValid ? '✅' : '❌'}</span>
            </div>
            <div class="vblock-body">
                <div class="vblock-field">
                    <span class="vfield-label">前哈希</span>
                    <code class="vfield-value prev-hash">${block.prevHash.slice(0, 12)}...</code>
                </div>
                <div class="vblock-field">
                    <span class="vfield-label">数据</span>
                    <textarea class="vfield-data" data-block="${i}">${block.data}</textarea>
                </div>
                <div class="vblock-field">
                    <span class="vfield-label">Nonce</span>
                    <code class="vfield-value">${block.nonce}</code>
                </div>
                <div class="vblock-field hash-field">
                    <span class="vfield-label">哈希</span>
                    <code class="vfield-value block-hash ${block.hash.startsWith(chainTarget) ? 'valid-hash' : 'invalid-hash'}">${block.hash.slice(0, 16)}...</code>
                </div>
            </div>
            ${isTampered ? '<div class="tamper-badge">⚠️ 已被篡改</div>' : ''}
        `;
        blockchainVisual.appendChild(blockEl);

        // 数据修改监听
        const textarea = blockEl.querySelector('textarea');
        textarea.addEventListener('input', (e) => {
            handleDataTamper(i, e.target.value);
        });
    });

    // 更新统计
    chainLengthEl.textContent = chain.length;
    if (validation.valid) {
        chainStatusEl.textContent = '有效 ✅';
        chainStatusEl.className = 'stat-value valid';
        tamperExplanation.style.display = 'none';
        tamperedBlockIndex = null;
    } else {
        chainStatusEl.textContent = '无效 ❌';
        chainStatusEl.className = 'stat-value invalid';
    }

    // 滚动到最新
    blockchainVisual.scrollLeft = blockchainVisual.scrollWidth;
}

// ==========================================
// 处理数据篡改
// ==========================================
function handleDataTamper(blockIndex, newData) {
    chain[blockIndex].data = newData;
    // 重新计算该区块哈希（但不重新挖矿，导致哈希无效）
    chain[blockIndex].hash = calculateChainBlockHash(chain[blockIndex]);

    // 更新后续区块的前哈希
    for (let i = blockIndex + 1; i < chain.length; i++) {
        chain[i].prevHash = chain[i-1].hash;
        chain[i].hash = calculateChainBlockHash(chain[i]);
    }

    tamperedBlockIndex = blockIndex;
    tamperedBlockEl.textContent = `#${blockIndex}`;
    tamperExplanation.style.display = 'block';

    renderBlockchain();
}

// ==========================================
// 修复篡改（重新挖矿）
// ==========================================
async function fixTamperedChain() {
    if (tamperedBlockIndex === null) return;

    fixChainBtn.disabled = true;
    fixChainBtn.textContent = '⛏️ 重新挖矿中...';

    for (let i = tamperedBlockIndex; i < chain.length; i++) {
        if (i > 0) {
            chain[i].prevHash = chain[i-1].hash;
        }
        await mineChainBlock(chain[i]);
        renderBlockchain();
    }

    fixChainBtn.disabled = false;
    fixChainBtn.textContent = '⛏️ 重新挖矿修复';
    tamperExplanation.style.display = 'none';
    tamperedBlockIndex = null;
}

// ==========================================
// 增长演示
// ==========================================
let growthPhase = 0;
let currentGrowthTxs = [];

function resetGrowthDemo() {
    growthPhase = 0;
    currentGrowthTxs = [];

    // 重置交易池
    txPool.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const tx = sampleTransactions[(txPoolIndex + i) % sampleTransactions.length];
        const txEl = document.createElement('div');
        txEl.className = 'pending-tx';
        txEl.dataset.tx = i;
        txEl.textContent = `💸 ${tx.from} → ${tx.to}: ${tx.amount} BTC`;
        txPool.appendChild(txEl);
    }

    // 重置打包区
    packPrevHash.textContent = '等待中...';
    packTxs.textContent = '0 笔';
    packNonce.textContent = '-';

    // 重置挖矿区
    miningStatus.textContent = '等待开始';
    miningFill.style.width = '0%';
    miningCurrentHash.textContent = '-';

    // 重置上链指示
    addedIndicator.innerHTML = `
        <span class="added-icon">⏳</span>
        <span class="added-text">等待区块</span>
    `;

    // 移除所有高亮
    document.querySelectorAll('.growth-stage').forEach(el => el.classList.remove('active', 'complete'));

    startGrowthBtn.disabled = false;
    startGrowthBtn.textContent = '▶️ 开始演示';
}

async function runGrowthDemo() {
    startGrowthBtn.disabled = true;

    // 阶段1: 从交易池选择交易
    document.getElementById('stage-txpool').classList.add('active');
    startGrowthBtn.textContent = '📦 选择交易...';

    currentGrowthTxs = [];
    const txEls = txPool.querySelectorAll('.pending-tx');
    for (let i = 0; i < txEls.length; i++) {
        await sleep(300);
        txEls[i].classList.add('selected');
        const tx = sampleTransactions[(txPoolIndex + i) % sampleTransactions.length];
        currentGrowthTxs.push(tx);
    }
    await sleep(500);
    document.getElementById('stage-txpool').classList.remove('active');
    document.getElementById('stage-txpool').classList.add('complete');

    // 阶段2: 打包区块
    document.getElementById('stage-packaging').classList.add('active');
    startGrowthBtn.textContent = '📦 打包中...';

    const prevBlock = chain[chain.length - 1];
    packPrevHash.textContent = prevBlock.hash.slice(0, 12) + '...';
    await sleep(400);
    packTxs.textContent = `${currentGrowthTxs.length} 笔`;
    await sleep(400);
    packNonce.textContent = '0';
    await sleep(300);

    document.getElementById('stage-packaging').classList.remove('active');
    document.getElementById('stage-packaging').classList.add('complete');

    // 阶段3: 挖矿
    document.getElementById('stage-mining').classList.add('active');
    startGrowthBtn.textContent = '⛏️ 挖矿中...';
    miningStatus.textContent = '寻找有效哈希...';

    const newBlock = createChainBlock(chain.length, prevBlock.hash, currentGrowthTxs);

    await mineChainBlock(newBlock, (nonce, hash, found) => {
        packNonce.textContent = nonce;
        miningCurrentHash.textContent = hash.slice(0, 20) + '...';
        miningFill.style.width = Math.min(nonce / 100, 100) + '%';
        if (found) {
            miningStatus.textContent = '✅ 找到有效哈希！';
            miningFill.style.width = '100%';
            miningFill.style.background = 'var(--success)';
        }
    });

    await sleep(500);
    document.getElementById('stage-mining').classList.remove('active');
    document.getElementById('stage-mining').classList.add('complete');

    // 阶段4: 添加到链
    document.getElementById('stage-added').classList.add('active');
    startGrowthBtn.textContent = '⛓️ 上链中...';

    addedIndicator.innerHTML = `
        <span class="added-icon success">✅</span>
        <span class="added-text">区块 #${newBlock.index} 已添加</span>
    `;

    chain.push(newBlock);
    renderBlockchain();

    await sleep(500);
    document.getElementById('stage-added').classList.remove('active');
    document.getElementById('stage-added').classList.add('complete');

    // 更新交易池索引
    txPoolIndex = (txPoolIndex + 3) % sampleTransactions.length;

    startGrowthBtn.textContent = '▶️ 再来一次';
    startGrowthBtn.disabled = false;

    // 准备下一轮
    setTimeout(() => {
        resetGrowthDemo();
    }, 2000);
}

function toggleAutoGrowth() {
    if (autoGrowthInterval) {
        clearInterval(autoGrowthInterval);
        autoGrowthInterval = null;
        autoGrowthBtn.textContent = '🔄 自动增长';
        autoGrowthBtn.classList.remove('active');
    } else {
        autoGrowthBtn.textContent = '⏹️ 停止自动';
        autoGrowthBtn.classList.add('active');
        autoGrowthInterval = setInterval(() => {
            if (!startGrowthBtn.disabled) {
                runGrowthDemo();
            }
        }, 8000);
        // 立即开始第一次
        if (!startGrowthBtn.disabled) {
            runGrowthDemo();
        }
    }
}

// ==========================================
// 初始化区块链
// ==========================================
function initializeChain() {
    chain = [];

    // 创建创世区块
    const genesis = createChainBlock(0, '0'.repeat(64), []);
    genesis.data = 'Genesis Block 🎉';
    mineChainBlockSync(genesis);
    chain.push(genesis);

    // 添加两个初始区块
    for (let i = 1; i <= 2; i++) {
        const txs = [sampleTransactions[i % sampleTransactions.length]];
        const block = createChainBlock(i, chain[i-1].hash, txs);
        mineChainBlockSync(block);
        chain.push(block);
    }

    renderBlockchain();
    resetGrowthDemo();
}

// ==========================================
// 添加新区块（简单版）
// ==========================================
async function addNewBlock() {
    addBlockBtn.disabled = true;
    addBlockBtn.textContent = '⛏️ 挖矿中...';

    const prevBlock = chain[chain.length - 1];
    const tx = sampleTransactions[txPoolIndex % sampleTransactions.length];
    txPoolIndex++;

    const newBlock = createChainBlock(chain.length, prevBlock.hash, [tx]);
    await mineChainBlock(newBlock);
    chain.push(newBlock);

    renderBlockchain();

    addBlockBtn.disabled = false;
    addBlockBtn.textContent = '➕ 添加新区块';
}

// ==========================================
// 工具函数
// ==========================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// 事件绑定
// ==========================================
if (startGrowthBtn) startGrowthBtn.addEventListener('click', runGrowthDemo);
if (autoGrowthBtn) autoGrowthBtn.addEventListener('click', toggleAutoGrowth);
if (resetGrowthBtn) resetGrowthBtn.addEventListener('click', () => {
    if (autoGrowthInterval) {
        clearInterval(autoGrowthInterval);
        autoGrowthInterval = null;
        autoGrowthBtn.textContent = '🔄 自动增长';
        autoGrowthBtn.classList.remove('active');
    }
    resetGrowthDemo();
});

if (addBlockBtn) addBlockBtn.addEventListener('click', addNewBlock);
if (resetChainBtn) resetChainBtn.addEventListener('click', initializeChain);
if (fixChainBtn) fixChainBtn.addEventListener('click', fixTamperedChain);

// 启动
initializeChain();
