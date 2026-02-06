(function() {
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
const miningData = document.getElementById('mining-data');
const miningDifficulty = document.getElementById('mining-difficulty');
const miningDiffValue = document.getElementById('mining-diff-value');
const miningNonce = document.getElementById('mining-nonce');
const miningHash = document.getElementById('mining-hash');
const miningTarget = document.getElementById('mining-target');
const miningAttempts = document.getElementById('mining-attempts');
const miningStatus = document.getElementById('mining-status');
const miningTime = document.getElementById('mining-time');
const miningResult = document.getElementById('mining-result');
const foundNonce = document.getElementById('found-nonce');
const foundHash = document.getElementById('found-hash');
const startBtn = document.getElementById('start-mining');
const resetBtn = document.getElementById('reset-mining');

let miningInterval = null;
let startTime = null;
let attempts = 0;
let currentNonce = 0;

// 更新目标显示
function updateTarget() {
    const diff = parseInt(miningDifficulty.value);
    miningDiffValue.textContent = diff;
    miningTarget.textContent = '0'.repeat(diff) + 'x'.repeat(8 - diff) + '...';
}

// 计算哈希
function calculateHash(nonce) {
    const data = miningData.value + '|' + nonce;
    return sha256(data);
}

// 检查哈希是否满足难度
function checkHash(hash, difficulty) {
    const target = '0'.repeat(difficulty);
    return hash.startsWith(target);
}

// 更新显示
function updateDisplay(nonce, hash) {
    miningNonce.textContent = nonce.toLocaleString();
    miningHash.textContent = hash;
    miningAttempts.textContent = attempts.toLocaleString();

    // 高亮前导零
    const diff = parseInt(miningDifficulty.value);
    const zeros = hash.substring(0, diff);
    const rest = hash.substring(diff);
    miningHash.innerHTML = `<span class="hash-zeros">${zeros}</span>${rest}`;

    // 更新用时
    if (startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        miningTime.textContent = elapsed.toFixed(2) + 's';
    }
}

// 开始挖矿
function startMining() {
    if (miningInterval) {
        stopMining();
        return;
    }

    const difficulty = parseInt(miningDifficulty.value);
    currentNonce = 0;
    attempts = 0;
    startTime = Date.now();
    miningResult.style.display = 'none';
    miningStatus.textContent = typeof t === 'function' ? t('mining.status.mining') : '挖矿中...';
    miningStatus.className = 'stat-value mining';
    startBtn.textContent = typeof t === 'function' ? t('mining.btn.stop') : '⏹️ 停止挖矿';
    startBtn.classList.add('mining');
    miningData.disabled = true;
    miningDifficulty.disabled = true;

    miningInterval = setInterval(() => {
        // 每帧尝试多次
        for (let i = 0; i < 100; i++) {
            const hash = calculateHash(currentNonce);
            attempts++;

            if (checkHash(hash, difficulty)) {
                // 找到有效哈希
                stopMining();
                updateDisplay(currentNonce, hash);
                miningStatus.textContent = typeof t === 'function' ? t('mining.status.success') : '成功!';
                miningStatus.className = 'stat-value success';

                // 显示结果
                miningResult.style.display = 'block';
                foundNonce.textContent = currentNonce.toLocaleString();
                foundHash.textContent = hash;
                return;
            }

            currentNonce++;
        }

        // 更新显示
        const hash = calculateHash(currentNonce - 1);
        updateDisplay(currentNonce - 1, hash);
    }, 30);
}

// 停止挖矿
function stopMining() {
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    startBtn.textContent = typeof t === 'function' ? t('mining.btn.start') : '⛏️ 开始挖矿';
    startBtn.classList.remove('mining');
    miningData.disabled = false;
    miningDifficulty.disabled = false;

    const miningText = typeof t === 'function' ? t('mining.status.mining') : '挖矿中...';
    if (miningStatus.textContent === miningText) {
        miningStatus.textContent = typeof t === 'function' ? t('mining.status.stopped') : '已停止';
        miningStatus.className = 'stat-value';
    }
}

// 重置
function resetMining() {
    stopMining();
    currentNonce = 0;
    attempts = 0;
    startTime = null;
    miningNonce.textContent = '0';
    miningHash.textContent = '-';
    miningAttempts.textContent = '0';
    miningStatus.textContent = typeof t === 'function' ? t('mining.status.waiting') : '等待开始';
    miningStatus.className = 'stat-value';
    miningTime.textContent = '0.00s';
    miningResult.style.display = 'none';
}

// 事件监听
miningDifficulty.addEventListener('input', updateTarget);
startBtn.addEventListener('click', startMining);
resetBtn.addEventListener('click', resetMining);

// 初始化
updateTarget();

})();
