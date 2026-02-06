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
// 简化的数字签名演示（教学用途）
// 使用 HMAC-like 方案模拟签名过程
// ==========================================

let privateKey = '';
let publicKey = '';

// 生成随机十六进制字符串
function randomHex(length) {
    let result = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
}

// 生成密钥对（简化演示）
function generateKeyPair() {
    // 私钥：随机 32 字节
    privateKey = randomHex(64);
    // 公钥：私钥的哈希（简化，实际使用椭圆曲线）
    publicKey = sha256('pubkey:' + privateKey);
    return { privateKey, publicKey };
}

// 签名（简化：使用私钥和消息的组合哈希）
function sign(message, privKey) {
    const messageHash = sha256(message);
    // 签名 = hash(私钥 + 消息哈希)
    const signature = sha256(privKey + messageHash);
    return { signature, messageHash };
}

// 验证签名
function verify(message, signature, pubKey) {
    // 重新计算期望的签名
    const messageHash = sha256(message);
    const expectedSig = sha256(privateKey + messageHash);
    // 验证公钥是否匹配
    const expectedPubKey = sha256('pubkey:' + privateKey);

    return {
        isValid: signature === expectedSig && pubKey === expectedPubKey,
        messageHash,
        expectedSig
    };
}

// 截断显示哈希值
function truncateHash(hash, len = 16) {
    if (hash.length <= len) return hash;
    return hash.substring(0, len) + '...';
}

// ==========================================
// 动画辅助函数
// ==========================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function highlightStep(stepId, active = true) {
    const step = document.getElementById(stepId);
    if (step) {
        if (active) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    }
}

function showArrow(arrowId) {
    const arrow = document.getElementById(arrowId);
    if (arrow) {
        arrow.classList.add('active');
    }
}

// ==========================================
// UI 交互
// ==========================================
const generateKeysBtn = document.getElementById('generate-keys');
const privateKeyDisplay = document.getElementById('private-key');
const publicKeyDisplay = document.getElementById('public-key');
const messageInput = document.getElementById('message-input');
const signBtn = document.getElementById('sign-btn');
const signatureOutput = document.getElementById('signature-output');
const verifyMessage = document.getElementById('verify-message');
const verifySignature = document.getElementById('verify-signature');
const verifyBtn = document.getElementById('verify-btn');
const verifyResult = document.getElementById('verify-result');

// 签名过程元素
const signProcess = document.getElementById('sign-process');
const signMsgValue = document.getElementById('sign-msg-value');
const signHashValue = document.getElementById('sign-hash-value');
const signPrivkeyValue = document.getElementById('sign-privkey-value');
const signResultValue = document.getElementById('sign-result-value');

// 验证过程元素
const verifyProcess = document.getElementById('verify-process');
const verifyMsgDisplay = document.getElementById('verify-msg-display');
const verifyMsgHash = document.getElementById('verify-msg-hash');
const verifyExpectedSig = document.getElementById('verify-expected-sig');
const verifyProvidedSig = document.getElementById('verify-provided-sig');
const compareIcon = document.getElementById('compare-icon');
const verifyFinalIcon = document.getElementById('verify-final-icon');
const verifyFinalText = document.getElementById('verify-final-text');

// 生成密钥对
generateKeysBtn.addEventListener('click', () => {
    const keys = generateKeyPair();
    privateKeyDisplay.textContent = keys.privateKey;
    publicKeyDisplay.textContent = keys.publicKey;

    privateKeyDisplay.parentElement.classList.add('generated');
    publicKeyDisplay.parentElement.classList.add('generated');

    signBtn.disabled = false;
    verifyBtn.disabled = false;
    signatureOutput.textContent = typeof t === 'function' ? t('sig.ready') : '准备就绪，可以签名...';
    verifyResult.innerHTML = '';

    // 隐藏之前的过程
    signProcess.style.display = 'none';
    verifyProcess.style.display = 'none';
});

// 签名（带动画）
signBtn.addEventListener('click', async () => {
    const message = messageInput.value;
    if (!message) {
        signatureOutput.textContent = typeof t === 'function' ? t('sig.enter.message') : '请输入消息';
        return;
    }

    // 禁用按钮防止重复点击
    signBtn.disabled = true;

    // 重置并显示签名过程
    signProcess.style.display = 'block';
    ['sign-step-1', 'sign-step-2', 'sign-step-3', 'sign-step-4'].forEach(id => highlightStep(id, false));
    ['sign-arrow-1', 'sign-arrow-2', 'sign-arrow-3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    signMsgValue.textContent = '-';
    signHashValue.textContent = '-';
    signPrivkeyValue.textContent = '-';
    signResultValue.textContent = '-';
    signatureOutput.textContent = typeof t === 'function' ? t('sig.signing') : '签名中...';

    // 步骤1：显示原始消息
    await sleep(300);
    highlightStep('sign-step-1', true);
    signMsgValue.textContent = message.length > 20 ? message.substring(0, 20) + '...' : message;

    // 箭头1
    await sleep(400);
    showArrow('sign-arrow-1');

    // 步骤2：计算消息哈希
    await sleep(400);
    highlightStep('sign-step-2', true);
    const messageHash = sha256(message);
    signHashValue.textContent = truncateHash(messageHash);

    // 箭头2
    await sleep(400);
    showArrow('sign-arrow-2');

    // 步骤3：使用私钥
    await sleep(400);
    highlightStep('sign-step-3', true);
    signPrivkeyValue.textContent = truncateHash(privateKey) + ' + Hash';

    // 箭头3
    await sleep(400);
    showArrow('sign-arrow-3');

    // 步骤4：生成签名
    await sleep(400);
    highlightStep('sign-step-4', true);
    const { signature } = sign(message, privateKey);
    signResultValue.textContent = truncateHash(signature);

    // 显示最终签名
    await sleep(300);
    signatureOutput.textContent = signature;

    // 自动填充验证区域
    verifyMessage.value = message;
    verifySignature.value = signature;
    verifyResult.innerHTML = '';
    verifyProcess.style.display = 'none';

    // 重新启用按钮
    signBtn.disabled = false;
});

// 验证（带动画）
verifyBtn.addEventListener('click', async () => {
    const message = verifyMessage.value;
    const signature = verifySignature.value;

    if (!message || !signature) {
        verifyResult.innerHTML = `<span class="result-error">${typeof t === 'function' ? t('sig.enter.both') : '请输入消息和签名'}</span>`;
        return;
    }

    // 禁用按钮
    verifyBtn.disabled = true;

    // 重置并显示验证过程
    verifyProcess.style.display = 'block';
    ['verify-step-1', 'verify-step-2', 'verify-step-3', 'verify-step-4'].forEach(id => highlightStep(id, false));
    verifyMsgDisplay.textContent = '-';
    verifyMsgHash.textContent = '-';
    verifyExpectedSig.textContent = '-';
    verifyProvidedSig.textContent = '-';
    compareIcon.textContent = '⚖️';
    compareIcon.className = 'compare-icon';
    verifyFinalIcon.textContent = '❓';
    verifyFinalText.textContent = typeof t === 'function' ? t('sig.verify.process.verifying') : '验证中...';
    document.getElementById('verify-step-4').className = 'verify-final';
    verifyResult.innerHTML = '';

    // 步骤1：显示待验证消息
    await sleep(300);
    highlightStep('verify-step-1', true);
    verifyMsgDisplay.textContent = message.length > 25 ? message.substring(0, 25) + '...' : message;

    // 步骤2：计算消息哈希
    await sleep(500);
    highlightStep('verify-step-2', true);
    const { isValid, messageHash, expectedSig } = verify(message, signature, publicKey);
    verifyMsgHash.textContent = truncateHash(messageHash);

    // 步骤3：比较签名
    await sleep(500);
    highlightStep('verify-step-3', true);
    verifyExpectedSig.textContent = truncateHash(expectedSig);

    await sleep(300);
    verifyProvidedSig.textContent = truncateHash(signature);

    // 比较动画
    await sleep(500);
    if (isValid) {
        compareIcon.textContent = '✓';
        compareIcon.classList.add('match');
    } else {
        compareIcon.textContent = '✗';
        compareIcon.classList.add('mismatch');
    }

    // 步骤4：最终结果
    await sleep(500);
    highlightStep('verify-step-4', true);
    const finalStep = document.getElementById('verify-step-4');

    if (isValid) {
        verifyFinalIcon.textContent = '✅';
        verifyFinalText.textContent = typeof t === 'function' ? t('sig.verify.process.valid') : '签名有效';
        finalStep.classList.add('success');
        verifyResult.innerHTML = `<span class="result-success">${typeof t === 'function' ? t('sig.verify.valid') : '✅ 签名有效！消息确实由私钥持有者签署。'}</span>`;
    } else {
        verifyFinalIcon.textContent = '❌';
        verifyFinalText.textContent = typeof t === 'function' ? t('sig.verify.process.invalid') : '签名无效';
        finalStep.classList.add('error');
        verifyResult.innerHTML = `<span class="result-error">${typeof t === 'function' ? t('sig.verify.invalid') : '❌ 签名无效！消息可能被篡改或签名伪造。'}</span>`;
    }

    // 重新启用按钮
    verifyBtn.disabled = false;
});

// 消息变化时隐藏验证过程
verifyMessage.addEventListener('input', () => {
    verifyResult.innerHTML = '';
    verifyProcess.style.display = 'none';
});

verifySignature.addEventListener('input', () => {
    verifyResult.innerHTML = '';
    verifyProcess.style.display = 'none';
});

})();
