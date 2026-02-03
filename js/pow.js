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
// 挖矿模拟器
// ==========================================
let difficulty = 1;
let nonce = 0;
let mining = false;
let miningInterval = null;
let startTime = null;
let hashCount = 0;
const blockData = 'Block #123456 | Prev: 0000abc... | Tx: Alice→Bob 0.5 BTC';

// DOM 元素
const targetDisplay = document.getElementById('target-display');
const powTargetHash = document.getElementById('pow-target-hash');
const powAttempts = document.getElementById('pow-attempts');
const powExpected = document.getElementById('pow-expected');
const powSpeed = document.getElementById('pow-speed');
const powStatus = document.getElementById('pow-status');
const hashStream = document.getElementById('hash-stream');
const foundHash = document.getElementById('found-hash');
const validHashDisplay = document.getElementById('valid-hash-display');
const validNonce = document.getElementById('valid-nonce');
const startBtn = document.getElementById('pow-start');
const stepBtn = document.getElementById('pow-step');
const resetBtn = document.getElementById('pow-reset');
const diffButtons = document.querySelectorAll('.diff-btn');

// 难度选择
diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (mining) return;
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = parseInt(btn.dataset.diff);
        updateTargetDisplay();
        resetMining();
    });
});

function updateTargetDisplay() {
    const target = '0'.repeat(difficulty) + 'x'.repeat(8 - difficulty) + '...';
    if (targetDisplay) targetDisplay.textContent = target;
    if (powTargetHash) powTargetHash.textContent = target;
    if (powExpected) powExpected.textContent = '~' + Math.pow(16, difficulty).toLocaleString();
}

function getHash(n) {
    return sha256(blockData + n);
}

function addHashToStream(hash, success) {
    const entry = document.createElement('div');
    entry.className = `hash-entry ${success ? 'success' : ''}`;

    const prefix = hash.slice(0, difficulty);
    const rest = hash.slice(difficulty, 16);

    entry.innerHTML = `
        <span class="hash-prefix ${success ? 'valid' : ''}">${prefix}</span><span class="hash-rest">${rest}...</span>
    `;

    hashStream.appendChild(entry);

    // 保持最近20条
    while (hashStream.children.length > 20) {
        hashStream.removeChild(hashStream.firstChild);
    }

    hashStream.scrollTop = hashStream.scrollHeight;
}

function mineStep() {
    const hash = getHash(nonce);
    const targetPrefix = '0'.repeat(difficulty);
    const success = hash.startsWith(targetPrefix);

    addHashToStream(hash, success);
    hashCount++;

    powAttempts.textContent = nonce.toLocaleString();

    if (success) {
        stopMining();
        foundHash.style.display = 'block';
        validHashDisplay.textContent = hash;
        validNonce.textContent = nonce.toLocaleString();
        powStatus.textContent = '🎉 成功!';
        startBtn.disabled = true;
        stepBtn.disabled = true;
        return true;
    }

    nonce++;
    return false;
}

function startMining() {
    if (mining) {
        stopMining();
        return;
    }

    mining = true;
    startTime = Date.now();
    hashCount = 0;
    startBtn.textContent = '⏸️ 暂停';
    stepBtn.disabled = true;
    powStatus.textContent = '⛏️ 挖矿中...';

    miningInterval = setInterval(() => {
        // 每帧计算多个哈希
        for (let i = 0; i < 50; i++) {
            if (mineStep()) {
                return;
            }
        }

        // 更新速度
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = Math.round(hashCount / elapsed);
        powSpeed.textContent = speed.toLocaleString() + ' H/s';
    }, 50);
}

function stopMining() {
    mining = false;
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    startBtn.textContent = '▶️ 继续挖矿';
    stepBtn.disabled = false;
    if (powStatus.textContent === '⛏️ 挖矿中...') {
        powStatus.textContent = '⏸️ 已暂停';
    }
}

function resetMining() {
    stopMining();
    nonce = 0;
    hashCount = 0;
    powAttempts.textContent = '0';
    powSpeed.textContent = '0 H/s';
    powStatus.textContent = '就绪';
    hashStream.innerHTML = '';
    foundHash.style.display = 'none';
    startBtn.textContent = '▶️ 开始挖矿';
    startBtn.disabled = false;
    stepBtn.disabled = false;
}

if (startBtn) startBtn.addEventListener('click', startMining);
if (stepBtn) stepBtn.addEventListener('click', () => {
    if (!mining) mineStep();
});
if (resetBtn) resetBtn.addEventListener('click', resetMining);

// ==========================================
// 51% 攻击成本计算器
// ==========================================
const calcAttackBtn = document.getElementById('calc-attack');
const attackDuration = document.getElementById('attack-duration');
const attackResults = document.getElementById('attack-results');

if (calcAttackBtn) {
    calcAttackBtn.addEventListener('click', () => {
        const hours = parseInt(attackDuration.value);

        // 网络参数（数据来源: mempool.space）
        const networkHashrate = 880; // EH/s (2024年数据)
        const neededHashrate = networkHashrate * 0.51; // 需要51%
        const asicPrice = 3000; // 美元/台 (Antminer S21 约$3000)
        const asicHashrate = 0.0002; // EH/s per ASIC (200 TH/s, S21级别)
        const asicsNeeded = neededHashrate / asicHashrate;
        const hardwareCost = asicsNeeded * asicPrice;

        const powerPerAsic = 3000; // W
        const totalPower = asicsNeeded * powerPerAsic / 1e9; // GW
        const electricityCost = 0.05; // $/kWh
        const powerCostPerHour = totalPower * 1e6 * electricityCost;
        const totalPowerCost = powerCostPerHour * hours;

        const totalCost = hardwareCost + totalPowerCost;

        // 显示结果
        document.getElementById('needed-hashrate').textContent = neededHashrate.toFixed(0) + ' EH/s';
        document.getElementById('hardware-cost').textContent = '$' + (hardwareCost / 1e9).toFixed(1) + 'B';
        document.getElementById('power-cost').textContent = '$' + (powerCostPerHour / 1e6).toFixed(1) + 'M/小时';
        document.getElementById('total-cost').textContent = '$' + (totalCost / 1e9).toFixed(1) + 'B+';

        // 更新对比条
        const potentialGain = hours * 6 * 3.125 * 50000; // 假设每小时6个区块，每BTC $50000
        document.getElementById('potential-gain').textContent = '$' + (potentialGain / 1e6).toFixed(0) + 'M';
        document.getElementById('attack-cost-bar').textContent = '$' + (totalCost / 1e9).toFixed(1) + 'B+';

        // 调整条宽度
        const gainPercent = Math.min((potentialGain / totalCost) * 100, 100);
        document.querySelector('.comp-fill.gain').style.width = gainPercent + '%';

        attackResults.style.display = 'block';
        attackResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

// ==========================================
// 难度调整模拟
// ==========================================
const hashrateChange = document.getElementById('hashrate-change');
const hashrateChangeValue = document.getElementById('hashrate-change-value');
const oldBlockTime = document.getElementById('old-block-time');
const newBlockTime = document.getElementById('new-block-time');
const timelineFill = document.getElementById('timeline-fill');
const timelineMarker = document.getElementById('timeline-marker');

if (hashrateChange) {
    hashrateChange.addEventListener('input', () => {
        const change = parseInt(hashrateChange.value);
        const sign = change >= 0 ? '+' : '';
        hashrateChangeValue.textContent = sign + change + '%';

        // 算力变化影响出块时间
        // 算力增加 -> 出块变快 -> 需要增加难度
        const factor = 1 + change / 100;
        const newTime = 10 / factor; // 分钟

        const mins = Math.floor(newTime);
        const secs = Math.round((newTime - mins) * 60);
        oldBlockTime.textContent = mins + ':' + secs.toString().padStart(2, '0');

        // 调整后恢复10分钟
        newBlockTime.textContent = '10:00';

        // 更新时间线
        // 中点是2周，左边是更快（<2周），右边是更慢（>2周）
        const actualWeeks = 2 / factor;
        const position = Math.max(0, Math.min(100, (actualWeeks / 4) * 100));
        timelineFill.style.width = position + '%';
        timelineMarker.style.left = position + '%';
    });
}

// ==========================================
// 初始化
// ==========================================
updateTargetDisplay();
