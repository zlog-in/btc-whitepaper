(function() {
// ==========================================
// 时间锁交互演示
// ==========================================

// 复用加密函数
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
    const bytes = typeof message === 'string' ? utf8Encode(message) : message;
    const bitLength = bytes.length * 8;
    const msgBytes = [...bytes];
    msgBytes.push(0x80);
    while ((msgBytes.length % 64) !== 56) msgBytes.push(0);
    for (let i = 7; i >= 0; i--) msgBytes.push((bitLength >>> (i * 8)) & 0xff);
    for (let chunk = 0; chunk < msgBytes.length; chunk += 64) {
        const w = new Array(64);
        for (let i = 0; i < 16; i++) w[i] = (msgBytes[chunk+i*4]<<24)|(msgBytes[chunk+i*4+1]<<16)|(msgBytes[chunk+i*4+2]<<8)|msgBytes[chunk+i*4+3];
        for (let i = 16; i < 64; i++) { const s0 = rightRotate(w[i-15],7)^rightRotate(w[i-15],18)^(w[i-15]>>>3); const s1 = rightRotate(w[i-2],17)^rightRotate(w[i-2],19)^(w[i-2]>>>10); w[i] = (w[i-16]+s0+w[i-7]+s1)|0; }
        let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;
        for (let i = 0; i < 64; i++) { const S1=rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25); const ch=(e&f)^(~e&g); const temp1=(h+S1+ch+k[i]+w[i])|0; const S0=rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22); const maj=(a&b)^(a&c)^(b&c); const temp2=(S0+maj)|0; h=g;g=f;f=e;e=(d+temp1)|0;d=c;c=b;b=a;a=(temp1+temp2)|0; }
        h0=(h0+a)|0;h1=(h1+b)|0;h2=(h2+c)|0;h3=(h3+d)|0;h4=(h4+e)|0;h5=(h5+f)|0;h6=(h6+g)|0;h7=(h7+h)|0;
    }
    function toHex(n) { return ('00000000'+(n>>>0).toString(16)).slice(-8); }
    return toHex(h0)+toHex(h1)+toHex(h2)+toHex(h3)+toHex(h4)+toHex(h5)+toHex(h6)+toHex(h7);
}

function sha256Bytes(message) {
    const hex = sha256(message);
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
    return bytes;
}

function ripemd160(bytes) {
    function leftRotate(x, n) { return ((x << n) | (x >>> (32 - n))) >>> 0; }
    function f(j, x, y, z) {
        if (j < 16) return x ^ y ^ z;
        if (j < 32) return (x & y) | (~x & z);
        if (j < 48) return (x | ~y) ^ z;
        if (j < 64) return (x & z) | (y & ~z);
        return x ^ (y | ~z);
    }
    const K = [0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
    const KK = [0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];
    const r = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13];
    const rr = [5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11];
    const s = [11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6];
    const ss = [8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11];
    const msg = [...bytes];
    const bitLength = bytes.length * 8;
    msg.push(0x80);
    while ((msg.length % 64) !== 56) msg.push(0);
    for (let i = 0; i < 8; i++) msg.push((bitLength >>> (i * 8)) & 0xff);
    let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
    for (let block = 0; block < msg.length; block += 64) {
        const x = [];
        for (let i = 0; i < 16; i++) {
            x[i] = msg[block + i*4] | (msg[block + i*4 + 1] << 8) | (msg[block + i*4 + 2] << 16) | (msg[block + i*4 + 3] << 24);
            x[i] = x[i] >>> 0;
        }
        let a = h0, b = h1, c = h2, d = h3, e = h4;
        let aa = h0, bb = h1, cc = h2, dd = h3, ee = h4;
        for (let j = 0; j < 80; j++) {
            const jj = Math.floor(j / 16);
            let t = (a + f(j, b, c, d) + x[r[j]] + K[jj]) >>> 0;
            t = (leftRotate(t, s[j]) + e) >>> 0;
            a = e; e = d; d = leftRotate(c, 10); c = b; b = t;
            t = (aa + f(79-j, bb, cc, dd) + x[rr[j]] + KK[jj]) >>> 0;
            t = (leftRotate(t, ss[j]) + ee) >>> 0;
            aa = ee; ee = dd; dd = leftRotate(cc, 10); cc = bb; bb = t;
        }
        const t = (h1 + c + dd) >>> 0;
        h1 = (h2 + d + ee) >>> 0; h2 = (h3 + e + aa) >>> 0; h3 = (h4 + a + bb) >>> 0; h4 = (h0 + b + cc) >>> 0; h0 = t;
    }
    const result = [];
    [h0, h1, h2, h3, h4].forEach(h => {
        result.push(h & 0xff); result.push((h >>> 8) & 0xff); result.push((h >>> 16) & 0xff); result.push((h >>> 24) & 0xff);
    });
    return result.map(b => ('0' + b.toString(16)).slice(-2)).join('');
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(bytes) {
    let leadingZeros = 0;
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) leadingZeros++;
    let num = BigInt(0);
    for (let i = 0; i < bytes.length; i++) num = num * BigInt(256) + BigInt(bytes[i]);
    let result = '';
    while (num > 0) {
        const remainder = num % BigInt(58);
        num = num / BigInt(58);
        result = BASE58_ALPHABET[Number(remainder)] + result;
    }
    for (let i = 0; i < leadingZeros; i++) result = '1' + result;
    return result;
}

function base58Check(payload, version = 0x00) {
    const versionedPayload = [version, ...payload];
    const firstHash = sha256Bytes(versionedPayload);
    const secondHash = sha256Bytes(firstHash);
    const checksum = secondHash.slice(0, 4);
    return base58Encode([...versionedPayload, ...checksum]);
}

function randomHex(length) {
    let result = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * 16)];
    return result;
}

function hexToBytes(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
    return bytes;
}

function hash160(hexData) {
    return ripemd160(sha256Bytes(hexToBytes(hexData)));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function encodeScriptNum(num) {
    if (num === 0) return '00';
    if (num >= 1 && num <= 16) return (0x50 + num).toString(16);
    const bytes = [];
    let n = num;
    while (n > 0) {
        bytes.push(n & 0xff);
        n = n >> 8;
    }
    if (bytes.length > 0 && (bytes[bytes.length - 1] & 0x80)) bytes.push(0x00);
    const lenHex = bytes.length.toString(16).padStart(2, '0');
    const bytesHex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    return lenHex + bytesHex;
}

// ==========================================
// 状态管理
// ==========================================
let currentBlockHeight = 840000;
let lockHeight = 840100;
let privateKey = '';
let publicKey = '';
let timelockAddress = '';
let redeemScript = '';

// ==========================================
// UI 元素
// ==========================================
const blockHeightDisplay = document.getElementById('current-block-height');
const lockHeightInput = document.getElementById('lock-height');
const lockHint = document.getElementById('lock-hint');
const createBtn = document.getElementById('create-timelock-btn');
const timelockCreation = document.getElementById('timelock-creation');
const spendSimulation = document.getElementById('spend-simulation');
const verifyProcess = document.getElementById('verify-process');

// 更新区块高度显示
function updateBlockHeight() {
    blockHeightDisplay.textContent = currentBlockHeight.toLocaleString();
    updateLockStatus();
    updateSpendCheck();
}

// 更新锁定状态
function updateLockStatus() {
    const lockStatus = document.getElementById('lock-status');
    if (!lockStatus) return;

    const remaining = lockHeight - currentBlockHeight;
    if (remaining > 0) {
        lockStatus.innerHTML = `<span class="status-locked">🔒 ${typeof t === 'function' ? t('timelock.locked') : '已锁定'} - ${typeof t === 'function' ? t('timelock.remaining') : '还需'} ${remaining} ${typeof t === 'function' ? t('timelock.blocks') : '个区块'}</span>`;
        lockStatus.className = 'lock-status locked';
    } else {
        lockStatus.innerHTML = `<span class="status-unlocked">🔓 ${typeof t === 'function' ? t('timelock.unlocked') : '已解锁'} - ${typeof t === 'function' ? t('timelock.can.spend') : '可以花费'}</span>`;
        lockStatus.className = 'lock-status unlocked';
    }
}

// 更新花费检查
function updateSpendCheck() {
    const checkCurrent = document.getElementById('check-current');
    const checkRequired = document.getElementById('check-required');
    const checkStatus = document.getElementById('check-status');

    if (!checkCurrent) return;

    checkCurrent.textContent = currentBlockHeight.toLocaleString();
    checkRequired.textContent = lockHeight.toLocaleString();

    if (currentBlockHeight >= lockHeight) {
        checkStatus.innerHTML = `<span class="check-pass">✅ ${typeof t === 'function' ? t('timelock.check.pass') : '通过'} (${currentBlockHeight} ≥ ${lockHeight})</span>`;
    } else {
        checkStatus.innerHTML = `<span class="check-fail">❌ ${typeof t === 'function' ? t('timelock.check.fail') : '未通过'} (${currentBlockHeight} < ${lockHeight})</span>`;
    }
}

// 挖矿按钮
document.getElementById('mine-block-btn').addEventListener('click', () => {
    currentBlockHeight++;
    updateBlockHeight();
    animateBlockMined();
});

document.getElementById('mine-10-btn').addEventListener('click', () => {
    currentBlockHeight += 10;
    updateBlockHeight();
    animateBlockMined();
});

document.getElementById('mine-100-btn').addEventListener('click', () => {
    currentBlockHeight += 100;
    updateBlockHeight();
    animateBlockMined();
});

function animateBlockMined() {
    blockHeightDisplay.classList.add('block-mined');
    setTimeout(() => blockHeightDisplay.classList.remove('block-mined'), 300);
}

// 更新锁定提示
lockHeightInput.addEventListener('input', () => {
    const inputHeight = parseInt(lockHeightInput.value) || 0;
    const diff = inputHeight - currentBlockHeight;

    if (diff > 0) {
        // 约10分钟一个区块
        const minutes = diff * 10;
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        let timeStr = '';
        if (days > 0) {
            timeStr = `≈ ${days} ${typeof t === 'function' ? t('timelock.days') : '天'}`;
        } else if (hours > 0) {
            timeStr = `≈ ${hours} ${typeof t === 'function' ? t('timelock.hours') : '小时'}`;
        } else {
            timeStr = `≈ ${minutes} ${typeof t === 'function' ? t('timelock.minutes') : '分钟'}`;
        }
        lockHint.textContent = timeStr;
        lockHint.className = 'config-hint future';
    } else {
        lockHint.textContent = typeof t === 'function' ? t('timelock.already.passed') : '(已过期)';
        lockHint.className = 'config-hint past';
    }
});

// 创建时间锁地址
createBtn.addEventListener('click', async () => {
    createBtn.disabled = true;
    lockHeight = parseInt(lockHeightInput.value) || 840100;

    // 生成密钥对
    privateKey = randomHex(64);
    const pubKeyX = sha256('pubkey:' + privateKey);
    const prefix = parseInt(pubKeyX.slice(-1), 16) % 2 === 0 ? '02' : '03';
    publicKey = prefix + pubKeyX;

    await sleep(200);

    // 显示密钥
    document.getElementById('tl-private-key').textContent = privateKey;
    document.getElementById('tl-public-key').textContent = publicKey;

    // 构建脚本
    const lockHeightHex = encodeScriptNum(lockHeight);
    redeemScript = lockHeightHex + 'b1' + '75' + '21' + publicKey + 'ac';

    // 将 lockHeight 转换为小端十六进制显示
    const lockHeightLE = lockHeightHex.slice(2); // 去掉长度前缀
    document.getElementById('tl-script-visual').innerHTML = `
        <span class="script-data">&lt;${lockHeight}&gt;</span>
        <span class="script-op">OP_CLTV</span>
        <span class="script-op">OP_DROP</span>
        <span class="script-data">&lt;PubKey&gt;</span>
        <span class="script-op">OP_CHECKSIG</span>
    `;
    document.getElementById('tl-script-hex').textContent = redeemScript;

    // 生成地址
    const scriptHash = hash160(redeemScript);
    timelockAddress = base58Check(hexToBytes(scriptHash), 0x05);
    document.getElementById('tl-address').textContent = timelockAddress;

    timelockCreation.style.display = 'block';
    updateLockStatus();

    // 显示花费模拟
    await sleep(300);
    document.getElementById('spend-from').textContent = timelockAddress;
    spendSimulation.style.display = 'block';
    verifyProcess.style.display = 'block';
    updateSpendCheck();

    createBtn.disabled = false;
});

// 尝试花费
document.getElementById('try-spend-btn').addEventListener('click', async () => {
    const btn = document.getElementById('try-spend-btn');
    const result = document.getElementById('spend-result');
    const timeline = document.getElementById('verify-timeline');

    btn.disabled = true;
    btn.textContent = '⏳ ...';
    result.style.display = 'none';
    timeline.innerHTML = '';

    // 步骤1：检查时间锁
    await sleep(400);
    const step1 = document.createElement('div');
    step1.className = 'verify-step';
    const timeLockPassed = currentBlockHeight >= lockHeight;
    step1.innerHTML = `
        <span class="step-icon">${timeLockPassed ? '✅' : '❌'}</span>
        <div class="step-detail">
            <strong>${typeof t === 'function' ? t('timelock.verify.step1') : '检查时间锁'}</strong>
            <p>OP_CHECKLOCKTIMEVERIFY: ${currentBlockHeight} ${timeLockPassed ? '≥' : '<'} ${lockHeight}</p>
        </div>
    `;
    step1.classList.add(timeLockPassed ? 'pass' : 'fail');
    timeline.appendChild(step1);

    if (!timeLockPassed) {
        // 时间锁未通过
        await sleep(300);
        result.innerHTML = `
            <div class="result-fail">
                <div class="result-icon">❌</div>
                <h4>${typeof t === 'function' ? t('timelock.tx.rejected') : '交易被拒绝'}</h4>
                <p>${typeof t === 'function' ? t('timelock.tx.reason') : '原因'}: ${typeof t === 'function' ? t('timelock.not.unlocked') : '时间锁尚未解锁'}</p>
                <p class="result-hint">${typeof t === 'function' ? t('timelock.try.mining') : '尝试点击"挖矿"按钮增加区块高度'}</p>
            </div>
        `;
        result.style.display = 'block';

        btn.textContent = typeof t === 'function' ? t('timelock.try.spend') : '✍️ 尝试签名并花费';
        btn.disabled = false;
        return;
    }

    // 步骤2：验证签名
    await sleep(400);
    const signature = sha256(privateKey + timelockAddress + Date.now()).slice(0, 128);
    const step2 = document.createElement('div');
    step2.className = 'verify-step pass';
    step2.innerHTML = `
        <span class="step-icon">✅</span>
        <div class="step-detail">
            <strong>${typeof t === 'function' ? t('timelock.verify.step2') : '生成签名'}</strong>
            <p><code>${signature.slice(0, 32)}...</code></p>
        </div>
    `;
    timeline.appendChild(step2);

    // 步骤3：验证签名有效性
    await sleep(400);
    const step3 = document.createElement('div');
    step3.className = 'verify-step pass';
    step3.innerHTML = `
        <span class="step-icon">✅</span>
        <div class="step-detail">
            <strong>${typeof t === 'function' ? t('timelock.verify.step3') : '验证签名'}</strong>
            <p>OP_CHECKSIG: ${typeof t === 'function' ? t('timelock.sig.valid') : '签名有效'}</p>
        </div>
    `;
    timeline.appendChild(step3);

    // 成功
    await sleep(400);
    const txid = sha256(signature + timelockAddress);
    result.innerHTML = `
        <div class="result-success">
            <div class="result-icon">🎉</div>
            <h4>${typeof t === 'function' ? t('timelock.tx.success') : '交易成功！'}</h4>
            <div class="txid-field">
                <label>TXID:</label>
                <code>${txid}</code>
            </div>
            <p>${typeof t === 'function' ? t('timelock.tx.confirmed') : '时间锁条件满足，资金已成功转出。'}</p>
        </div>
    `;
    result.style.display = 'block';

    btn.textContent = '✅ ' + (typeof t === 'function' ? t('timelock.spent') : '已花费');
});

// 初始化
updateBlockHeight();
lockHeightInput.dispatchEvent(new Event('input'));

})();
