// ==========================================
// 多重签名交互演示
// ==========================================

// SHA-256 实现
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
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
}

// RIPEMD-160 简化实现
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

// Base58 编码
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

// 辅助函数
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

// ==========================================
// 状态管理
// ==========================================
let participants = [];
let requiredSigs = 2;
let totalParticipants = 3;
let redeemScript = '';
let p2shAddress = '';
let txHash = '';
let collectedSignatures = [];

// ==========================================
// 密钥生成
// ==========================================
function generateKeyPair(index) {
    const privateKey = randomHex(64);
    const publicKeyX = sha256('pubkey_x:' + privateKey + ':' + index);
    const publicKeyY = sha256('pubkey_y:' + privateKey + ':' + index);
    const prefix = parseInt(publicKeyY.slice(-1), 16) % 2 === 0 ? '02' : '03';
    const compressedPubKey = prefix + publicKeyX;

    return {
        index,
        name: String.fromCharCode(65 + index), // A, B, C...
        privateKey,
        publicKey: compressedPubKey,
        hasSigned: false,
        signature: null
    };
}

function buildRedeemScript(m, pubKeys) {
    let script = '';
    script += (0x50 + m).toString(16); // OP_M
    for (const pk of pubKeys) {
        script += '21'; // PUSH 33 bytes
        script += pk;
    }
    script += (0x50 + pubKeys.length).toString(16); // OP_N
    script += 'ae'; // OP_CHECKMULTISIG
    return script;
}

function generateSignature(privateKey, message) {
    // 模拟 ECDSA 签名（简化）
    const r = sha256(privateKey + message + 'r').slice(0, 64);
    const s = sha256(privateKey + message + 's').slice(0, 64);
    return r + s;
}

function verifySignature(publicKey, message, signature) {
    // 模拟验签（简化，总是返回 true）
    return signature.length === 128;
}

// ==========================================
// UI 更新
// ==========================================
const generateKeysBtn = document.getElementById('generate-keys-btn');
const keysContainer = document.getElementById('keys-container');
const keysGrid = document.getElementById('keys-grid');
const scriptProcess = document.getElementById('script-process');
const txSimulation = document.getElementById('tx-simulation');
const verifyPanel = document.getElementById('verify-panel');
const multisigM = document.getElementById('multisig-m');
const multisigN = document.getElementById('multisig-n');

// 确保 M <= N
multisigM.addEventListener('change', () => {
    if (parseInt(multisigM.value) > parseInt(multisigN.value)) {
        multisigN.value = multisigM.value;
    }
});

multisigN.addEventListener('change', () => {
    if (parseInt(multisigM.value) > parseInt(multisigN.value)) {
        multisigM.value = multisigN.value;
    }
});

generateKeysBtn.addEventListener('click', async () => {
    generateKeysBtn.disabled = true;
    requiredSigs = parseInt(multisigM.value);
    totalParticipants = parseInt(multisigN.value);

    // 重置状态
    participants = [];
    collectedSignatures = [];

    // 生成密钥对
    keysGrid.innerHTML = '';
    for (let i = 0; i < totalParticipants; i++) {
        const participant = generateKeyPair(i);
        participants.push(participant);

        await sleep(200);

        const keyCard = document.createElement('div');
        keyCard.className = 'key-card';
        keyCard.innerHTML = `
            <div class="key-card-header">
                <span class="participant-badge">${participant.name}</span>
                <span class="participant-label">${typeof t === 'function' ? t('multisig.participant') : '参与方'} ${participant.name}</span>
            </div>
            <div class="key-field">
                <label>🔐 ${typeof t === 'function' ? t('multisig.privatekey') : '私钥'}</label>
                <code class="private-key">${participant.privateKey.slice(0, 16)}...${participant.privateKey.slice(-8)}</code>
            </div>
            <div class="key-field">
                <label>🔓 ${typeof t === 'function' ? t('multisig.publickey') : '公钥'}</label>
                <code class="public-key">${participant.publicKey}</code>
            </div>
        `;
        keysGrid.appendChild(keyCard);
    }

    keysContainer.style.display = 'block';

    // 构建脚本
    await sleep(300);
    buildAndShowScript();

    // 显示交易模拟
    await sleep(300);
    showTxSimulation();

    generateKeysBtn.disabled = false;
});

function buildAndShowScript() {
    const pubKeys = participants.map(p => p.publicKey);
    redeemScript = buildRedeemScript(requiredSigs, pubKeys);
    const scriptHash = hash160(redeemScript);
    p2shAddress = base58Check(hexToBytes(scriptHash), 0x05);

    // 显示脚本可视化
    const scriptVisual = document.getElementById('script-visual');
    const pubKeyVisuals = pubKeys.map((pk, i) =>
        `<span class="script-pubkey"><span class="pubkey-badge">${String.fromCharCode(65 + i)}</span>${pk.slice(0, 8)}...</span>`
    ).join(' ');

    scriptVisual.innerHTML = `
        <span class="script-op">OP_${requiredSigs}</span>
        ${pubKeyVisuals}
        <span class="script-op">OP_${totalParticipants}</span>
        <span class="script-op">OP_CHECKMULTISIG</span>
    `;

    document.getElementById('script-hex').innerHTML = `<small>${redeemScript.slice(0, 60)}...</small>`;
    document.getElementById('script-hash-value').textContent = scriptHash;
    document.getElementById('p2sh-address').textContent = p2shAddress;

    scriptProcess.style.display = 'block';
}

function showTxSimulation() {
    txHash = sha256('tx:' + p2shAddress + ':' + Date.now());

    document.getElementById('tx-from').textContent = p2shAddress;
    document.getElementById('tx-hash').textContent = txHash.slice(0, 32) + '...';

    // 签名面板
    const signersGrid = document.getElementById('signers-grid');
    signersGrid.innerHTML = '';

    participants.forEach(p => {
        const signerCard = document.createElement('div');
        signerCard.className = 'signer-card';
        signerCard.id = `signer-${p.index}`;
        signerCard.innerHTML = `
            <div class="signer-header">
                <span class="participant-badge">${p.name}</span>
                <span class="signer-status" id="status-${p.index}">⏳ ${typeof t === 'function' ? t('multisig.pending') : '待签名'}</span>
            </div>
            <button class="btn small sign-btn" id="sign-btn-${p.index}" onclick="signTransaction(${p.index})">
                ✍️ ${typeof t === 'function' ? t('multisig.sign') : '签名'}
            </button>
        `;
        signersGrid.appendChild(signerCard);
    });

    updateSigningHint();
    document.getElementById('signatures-list').innerHTML = '';
    document.getElementById('signature-status').innerHTML = '';

    txSimulation.style.display = 'block';
    verifyPanel.style.display = 'block';
    document.getElementById('verify-steps').innerHTML = '';
    document.getElementById('broadcast-btn').disabled = true;
    document.getElementById('broadcast-result').style.display = 'none';
}

function updateSigningHint() {
    const remaining = requiredSigs - collectedSignatures.length;
    const hint = document.getElementById('signing-hint');
    if (remaining > 0) {
        hint.innerHTML = `<span class="hint-warning">⚠️ ${typeof t === 'function' ? t('multisig.need') : '还需要'} <strong>${remaining}</strong> ${typeof t === 'function' ? t('multisig.more.sigs') : '个签名'}</span>`;
    } else {
        hint.innerHTML = `<span class="hint-success">✅ ${typeof t === 'function' ? t('multisig.enough') : '签名已足够！可以广播交易'}</span>`;
    }
}

window.signTransaction = async function(index) {
    const participant = participants[index];
    if (participant.hasSigned) return;

    const btn = document.getElementById(`sign-btn-${index}`);
    const status = document.getElementById(`status-${index}`);
    const card = document.getElementById(`signer-${index}`);

    btn.disabled = true;
    btn.textContent = '⏳ ...';

    await sleep(500);

    // 生成签名
    const signature = generateSignature(participant.privateKey, txHash);
    participant.signature = signature;
    participant.hasSigned = true;

    collectedSignatures.push({
        participant: participant.name,
        publicKey: participant.publicKey,
        signature
    });

    // 更新 UI
    card.classList.add('signed');
    status.innerHTML = `<span class="status-signed">✅ ${typeof t === 'function' ? t('multisig.signed') : '已签名'}</span>`;
    btn.textContent = '✅';
    btn.classList.add('signed');

    // 添加到签名列表
    const sigList = document.getElementById('signatures-list');
    const sigItem = document.createElement('div');
    sigItem.className = 'signature-item';
    sigItem.innerHTML = `
        <span class="sig-participant"><span class="participant-badge small">${participant.name}</span></span>
        <code class="sig-value">${signature.slice(0, 24)}...${signature.slice(-8)}</code>
    `;
    sigList.appendChild(sigItem);

    updateSigningHint();
    updateVerifyPanel();
};

function updateVerifyPanel() {
    const verifySteps = document.getElementById('verify-steps');
    verifySteps.innerHTML = '';

    collectedSignatures.forEach((sig, i) => {
        const isValid = verifySignature(sig.publicKey, txHash, sig.signature);
        const stepDiv = document.createElement('div');
        stepDiv.className = `verify-step ${isValid ? 'valid' : 'invalid'}`;
        stepDiv.innerHTML = `
            <span class="verify-icon">${isValid ? '✅' : '❌'}</span>
            <span class="verify-text">
                ${typeof t === 'function' ? t('multisig.verify.sig') : '验证签名'} ${sig.participant}:
                <strong>${isValid ? (typeof t === 'function' ? t('multisig.valid') : '有效') : (typeof t === 'function' ? t('multisig.invalid') : '无效')}</strong>
            </span>
        `;
        verifySteps.appendChild(stepDiv);
    });

    // 检查是否满足 M-of-N
    const broadcastBtn = document.getElementById('broadcast-btn');
    if (collectedSignatures.length >= requiredSigs) {
        broadcastBtn.disabled = false;

        const statusDiv = document.createElement('div');
        statusDiv.className = 'verify-status success';
        statusDiv.innerHTML = `✅ ${typeof t === 'function' ? t('multisig.threshold.met') : '已满足'} ${requiredSigs}-of-${totalParticipants} ${typeof t === 'function' ? t('multisig.threshold') : '签名要求'}`;
        verifySteps.appendChild(statusDiv);
    } else {
        broadcastBtn.disabled = true;
    }
}

document.getElementById('broadcast-btn').addEventListener('click', async () => {
    const btn = document.getElementById('broadcast-btn');
    btn.disabled = true;
    btn.textContent = '📡 ...';

    await sleep(1000);

    const result = document.getElementById('broadcast-result');
    const txid = sha256(txHash + collectedSignatures.map(s => s.signature).join(''));

    result.innerHTML = `
        <div class="broadcast-success">
            <div class="success-icon">🎉</div>
            <h4>${typeof t === 'function' ? t('multisig.broadcast.success') : '交易广播成功！'}</h4>
            <div class="txid-field">
                <label>TXID:</label>
                <code>${txid}</code>
            </div>
            <p class="broadcast-note">${typeof t === 'function' ? t('multisig.broadcast.note') : '交易已提交到网络，等待矿工确认。'}</p>
        </div>
    `;
    result.style.display = 'block';

    btn.textContent = '✅ ' + (typeof t === 'function' ? t('multisig.broadcasted') : '已广播');
});
