// ==========================================
// SHA-256 哈希函数
// ==========================================
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==========================================
// 哈希演示
// ==========================================
const hashInput = document.getElementById('hash-input');
const hashOutput = document.getElementById('hash-output');
const hashVisual = document.getElementById('hash-visual');

let previousHash = '';

async function updateHashDemo() {
    const input = hashInput.value;
    const hash = await sha256(input);

    // 逐字符对比，高亮变化的部分
    if (previousHash && previousHash !== hash) {
        let html = '';
        for (let i = 0; i < 64; i++) {
            const char = hash[i];
            const changed = previousHash[i] !== char;
            html += `<span class="${changed ? 'hash-char changed' : 'hash-char'}">${char}</span>`;
        }
        hashOutput.innerHTML = html;
        hashOutput.classList.add('hash-updated');
        setTimeout(() => hashOutput.classList.remove('hash-updated'), 300);
    } else {
        hashOutput.textContent = hash;
    }

    previousHash = hash;

    // 可视化哈希
    hashVisual.innerHTML = '';
    for (let i = 0; i < 64; i++) {
        const bit = document.createElement('div');
        bit.className = 'hash-bit';
        const value = parseInt(hash[i], 16);
        const hue = (value / 15) * 360;
        bit.style.background = `hsl(${hue}, 70%, 50%)`;
        hashVisual.appendChild(bit);
    }
}

hashInput.addEventListener('input', updateHashDemo);
hashInput.addEventListener('keydown', updateHashDemo);
updateHashDemo();

// ==========================================
// 单区块演示
// ==========================================
const prevHashInput = document.getElementById('prev-hash');
const timestampInput = document.getElementById('timestamp');
const blockDataInput = document.getElementById('block-data');
const nonceInput = document.getElementById('nonce');
const blockHashOutput = document.getElementById('block-hash');
const blockStatus = document.getElementById('block-status');
const difficultyInput = document.getElementById('difficulty');
const difficultyValue = document.getElementById('difficulty-value');
const mineBtn = document.getElementById('mine-btn');
const singleBlock = document.getElementById('single-block');

// 初始化时间戳
function updateTimestamp() {
    timestampInput.value = new Date().toISOString();
}
updateTimestamp();

async function getBlockHash() {
    const data = [
        prevHashInput.value,
        timestampInput.value,
        blockDataInput.value,
        nonceInput.value
    ].join('|');
    return await sha256(data);
}

async function updateBlockHash() {
    const hash = await getBlockHash();
    blockHashOutput.textContent = hash;

    const difficulty = parseInt(difficultyInput.value);
    const target = '0'.repeat(difficulty);
    const isValid = hash.startsWith(target);

    singleBlock.classList.remove('valid', 'invalid');
    singleBlock.classList.add(isValid ? 'valid' : 'invalid');
    blockStatus.textContent = isValid ? '✅ 有效区块' : '⏳ 待挖矿';
}

// 事件监听
blockDataInput.addEventListener('input', updateBlockHash);
nonceInput.addEventListener('input', updateBlockHash);

document.getElementById('nonce-minus').addEventListener('click', () => {
    nonceInput.value = Math.max(0, parseInt(nonceInput.value) - 1);
    updateBlockHash();
});

document.getElementById('nonce-plus').addEventListener('click', () => {
    nonceInput.value = parseInt(nonceInput.value) + 1;
    updateBlockHash();
});

difficultyInput.addEventListener('input', () => {
    difficultyValue.textContent = difficultyInput.value;
    updateBlockHash();
});

// 挖矿功能
let miningInterval = null;

mineBtn.addEventListener('click', async () => {
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
        mineBtn.textContent = '⛏️ 开始挖矿';
        mineBtn.classList.remove('mining');
        return;
    }

    mineBtn.textContent = '⏹️ 停止挖矿';
    mineBtn.classList.add('mining');

    const difficulty = parseInt(difficultyInput.value);
    const target = '0'.repeat(difficulty);
    let nonce = 0;

    const mine = async () => {
        for (let i = 0; i < 100; i++) {
            nonceInput.value = nonce;
            const hash = await getBlockHash();
            blockHashOutput.textContent = hash;

            if (hash.startsWith(target)) {
                clearInterval(miningInterval);
                miningInterval = null;
                mineBtn.textContent = '⛏️ 开始挖矿';
                mineBtn.classList.remove('mining');
                singleBlock.classList.remove('invalid');
                singleBlock.classList.add('valid');
                blockStatus.textContent = '✅ 有效区块';
                return;
            }
            nonce++;
        }
    };

    miningInterval = setInterval(mine, 50);
});

updateBlockHash();

// ==========================================
// 区块链演示
// ==========================================
const blockchain = document.getElementById('blockchain');
const addBlockBtn = document.getElementById('add-block-btn');
const resetChainBtn = document.getElementById('reset-chain-btn');
const tamperWarning = document.getElementById('tamper-warning');

let chain = [];
const chainDifficulty = 2;
const chainTarget = '0'.repeat(chainDifficulty);

function createChainBlock(index, prevHash, data = '') {
    return {
        index,
        prevHash,
        timestamp: new Date().toISOString(),
        data: data || `区块 #${index} 的交易数据`,
        nonce: 0,
        hash: ''
    };
}

async function calculateChainBlockHash(block) {
    const data = [
        block.prevHash,
        block.timestamp,
        block.data,
        block.nonce.toString()
    ].join('|');
    return await sha256(data);
}

async function mineChainBlock(block) {
    let nonce = 0;
    while (true) {
        block.nonce = nonce;
        block.hash = await calculateChainBlockHash(block);
        if (block.hash.startsWith(chainTarget)) {
            return block;
        }
        nonce++;
        if (nonce > 100000) break; // 防止无限循环
    }
    return block;
}

function renderBlockchain() {
    blockchain.innerHTML = '';

    chain.forEach((block, i) => {
        if (i > 0) {
            const link = document.createElement('div');
            link.className = 'chain-link';
            link.textContent = '→';
            blockchain.appendChild(link);
        }

        const isValid = block.hash.startsWith(chainTarget) &&
                       (i === 0 || block.prevHash === chain[i-1].hash);

        const blockEl = document.createElement('div');
        blockEl.className = `chain-block ${isValid ? 'valid' : 'invalid'}`;
        blockEl.innerHTML = `
            <div class="block-header">
                <span class="block-number">区块 #${block.index}</span>
                <span class="block-status">${isValid ? '✅' : '❌'}</span>
            </div>
            <div class="block-field">
                <label>前一哈希：</label>
                <input type="text" value="${block.prevHash.slice(0, 16)}..." readonly>
            </div>
            <div class="block-field">
                <label>数据：</label>
                <textarea data-block="${i}">${block.data}</textarea>
            </div>
            <div class="block-field">
                <label>Nonce：</label>
                <input type="text" value="${block.nonce}" readonly>
            </div>
            <div class="block-field">
                <label>哈希：</label>
                <div class="hash-display">${block.hash}</div>
            </div>
        `;

        blockchain.appendChild(blockEl);
    });

    // 添加数据修改监听
    document.querySelectorAll('.chain-block textarea').forEach(textarea => {
        textarea.addEventListener('input', async (e) => {
            const blockIndex = parseInt(e.target.dataset.block);
            chain[blockIndex].data = e.target.value;
            chain[blockIndex].hash = await calculateChainBlockHash(chain[blockIndex]);

            // 重新计算后续区块的哈希（不重新挖矿，只是展示失效）
            for (let i = blockIndex + 1; i < chain.length; i++) {
                chain[i].prevHash = chain[i-1].hash;
                chain[i].hash = await calculateChainBlockHash(chain[i]);
            }

            renderBlockchain();
            tamperWarning.style.display = 'block';
        });
    });
}

async function initializeChain() {
    chain = [];

    // 创始区块
    const genesis = createChainBlock(0, '0'.repeat(64), 'Genesis Block 🎉');
    await mineChainBlock(genesis);
    chain.push(genesis);

    // 添加几个初始区块
    for (let i = 1; i <= 2; i++) {
        const block = createChainBlock(i, chain[i-1].hash);
        await mineChainBlock(block);
        chain.push(block);
    }

    renderBlockchain();
    tamperWarning.style.display = 'none';
}

addBlockBtn.addEventListener('click', async () => {
    addBlockBtn.disabled = true;
    addBlockBtn.textContent = '⛏️ 挖矿中...';

    const prevBlock = chain[chain.length - 1];
    const newBlock = createChainBlock(chain.length, prevBlock.hash);
    await mineChainBlock(newBlock);
    chain.push(newBlock);

    renderBlockchain();

    addBlockBtn.disabled = false;
    addBlockBtn.textContent = '➕ 添加新区块';

    // 滚动到新区块
    blockchain.scrollLeft = blockchain.scrollWidth;
});

resetChainBtn.addEventListener('click', () => {
    initializeChain();
});

// 初始化区块链
initializeChain();

// ==========================================
// 工作量证明演示
// ==========================================
const powTarget = document.getElementById('pow-target');
const powAttempts = document.getElementById('pow-attempts');
const powStatus = document.getElementById('pow-status');
const powLog = document.getElementById('pow-log');
const powStepBtn = document.getElementById('pow-step');
const powAutoBtn = document.getElementById('pow-auto');
const powResetBtn = document.getElementById('pow-reset');

let powNonce = 0;
let powFound = false;
let powInterval = null;
const powDifficulty = 2;
const powTargetPrefix = '0'.repeat(powDifficulty);
const powBlockData = 'POW Demo Block';

powTarget.innerHTML = `哈希必须以 <code>${powTargetPrefix}</code> 开头`;

async function getPowHash(nonce) {
    return await sha256(powBlockData + nonce);
}

function addLogEntry(nonce, hash, success) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${success ? 'success' : 'fail'}`;
    entry.innerHTML = `
        <span>${nonce}</span>
        <span>${hash}</span>
        <span>${success ? '✅' : '❌'}</span>
    `;
    powLog.appendChild(entry);
    powLog.scrollTop = powLog.scrollHeight;
}

async function powStep() {
    if (powFound) return;

    const hash = await getPowHash(powNonce);
    const success = hash.startsWith(powTargetPrefix);

    addLogEntry(powNonce, hash, success);
    powAttempts.textContent = powNonce + 1;

    if (success) {
        powFound = true;
        powStatus.textContent = '🎉 找到有效 Nonce!';
        powStepBtn.disabled = true;
        powAutoBtn.disabled = true;

        if (powInterval) {
            clearInterval(powInterval);
            powInterval = null;
            powAutoBtn.textContent = '🚀 自动挖矿';
        }
    }

    powNonce++;
}

powStepBtn.addEventListener('click', powStep);

powAutoBtn.addEventListener('click', () => {
    if (powFound) return;

    if (powInterval) {
        clearInterval(powInterval);
        powInterval = null;
        powAutoBtn.textContent = '🚀 自动挖矿';
        powStatus.textContent = '已暂停';
    } else {
        powInterval = setInterval(async () => {
            for (let i = 0; i < 10; i++) {
                await powStep();
                if (powFound) break;
            }
        }, 100);
        powAutoBtn.textContent = '⏸️ 暂停';
        powStatus.textContent = '挖矿中...';
    }
});

powResetBtn.addEventListener('click', () => {
    if (powInterval) {
        clearInterval(powInterval);
        powInterval = null;
    }

    powNonce = 0;
    powFound = false;
    powAttempts.textContent = '0';
    powStatus.textContent = '就绪';
    powStepBtn.disabled = false;
    powAutoBtn.disabled = false;
    powAutoBtn.textContent = '🚀 自动挖矿';

    // 清除日志（保留标题）
    const header = powLog.querySelector('.header');
    powLog.innerHTML = '';
    powLog.appendChild(header);
});

// ==========================================
// 平滑滚动导航
// ==========================================
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
