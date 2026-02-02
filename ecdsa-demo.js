// ==========================================
// ECDSA 数字签名可视化演示
// 使用 secp256k1 椭圆曲线
// ==========================================

// secp256k1 曲线参数
const SECP256K1 = {
    // 有限域素数 p
    p: BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F'),
    // 曲线阶 n
    n: BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'),
    // 生成点 G
    Gx: BigInt('0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'),
    Gy: BigInt('0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8'),
    // 曲线参数 a, b (y² = x³ + ax + b)
    a: BigInt(0),
    b: BigInt(7)
};

// ==========================================
// 大整数模运算
// ==========================================

// 模运算（确保结果为正）
function mod(a, m) {
    const result = a % m;
    return result >= 0n ? result : result + m;
}

// 模逆元（扩展欧几里得算法）
function modInverse(a, m) {
    a = mod(a, m);
    if (a === 0n) return null;

    let [old_r, r] = [m, a];
    let [old_s, s] = [0n, 1n];

    while (r !== 0n) {
        const quotient = old_r / r;
        [old_r, r] = [r, old_r - quotient * r];
        [old_s, s] = [s, old_s - quotient * s];
    }

    if (old_r !== 1n) return null;
    return mod(old_s, m);
}

// 模乘
function modMul(a, b, m) {
    return mod(a * b, m);
}

// 模加
function modAdd(a, b, m) {
    return mod(a + b, m);
}

// 模减
function modSub(a, b, m) {
    return mod(a - b, m);
}

// ==========================================
// 椭圆曲线点运算
// ==========================================

// 点：{ x: BigInt, y: BigInt } 或 null（无穷远点）
const INFINITY = null;

// 判断是否为无穷远点
function isInfinity(P) {
    return P === null;
}

// 点加法
function pointAdd(P, Q) {
    if (isInfinity(P)) return Q;
    if (isInfinity(Q)) return P;

    const { p } = SECP256K1;

    if (P.x === Q.x) {
        if (mod(P.y + Q.y, p) === 0n) {
            return INFINITY;
        }
        // 点倍加
        return pointDouble(P);
    }

    // 斜率 λ = (Q.y - P.y) / (Q.x - P.x)
    const dx = modSub(Q.x, P.x, p);
    const dy = modSub(Q.y, P.y, p);
    const lambda = modMul(dy, modInverse(dx, p), p);

    // x₃ = λ² - P.x - Q.x
    const x3 = modSub(modSub(modMul(lambda, lambda, p), P.x, p), Q.x, p);
    // y₃ = λ(P.x - x₃) - P.y
    const y3 = modSub(modMul(lambda, modSub(P.x, x3, p), p), P.y, p);

    return { x: x3, y: y3 };
}

// 点倍加
function pointDouble(P) {
    if (isInfinity(P)) return INFINITY;
    if (P.y === 0n) return INFINITY;

    const { p, a } = SECP256K1;

    // 斜率 λ = (3x² + a) / (2y)
    const numerator = modAdd(modMul(3n, modMul(P.x, P.x, p), p), a, p);
    const denominator = modMul(2n, P.y, p);
    const lambda = modMul(numerator, modInverse(denominator, p), p);

    // x₃ = λ² - 2x
    const x3 = modSub(modMul(lambda, lambda, p), modMul(2n, P.x, p), p);
    // y₃ = λ(x - x₃) - y
    const y3 = modSub(modMul(lambda, modSub(P.x, x3, p), p), P.y, p);

    return { x: x3, y: y3 };
}

// 标量乘法（Double-and-Add 算法）
function scalarMult(k, P) {
    if (k === 0n || isInfinity(P)) return INFINITY;

    let result = INFINITY;
    let current = P;
    let scalar = k;

    while (scalar > 0n) {
        if (scalar & 1n) {
            result = pointAdd(result, current);
        }
        current = pointDouble(current);
        scalar >>= 1n;
    }

    return result;
}

// 生成点 G
function getGeneratorPoint() {
    return { x: SECP256K1.Gx, y: SECP256K1.Gy };
}

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

    const highBits = Math.floor(bitLength / 0x100000000);
    const lowBits = bitLength >>> 0;
    for (let i = 3; i >= 0; i--) bytes.push((highBits >>> (i * 8)) & 0xff);
    for (let i = 3; i >= 0; i--) bytes.push((lowBits >>> (i * 8)) & 0xff);

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

// 将哈希转为 BigInt
function hashToBigInt(hash) {
    return BigInt('0x' + hash);
}

// ==========================================
// ECDSA 签名算法
// ==========================================

class ECDSAVisualizer {
    constructor() {
        this.privateKey = null;
        this.publicKey = null;
        this.G = getGeneratorPoint();
        this.n = SECP256K1.n;

        // 计算中间值（用于可视化）
        this.signData = null;
        this.verifyData = null;
    }

    // 生成随机私钥
    generatePrivateKey() {
        // 生成 256 位随机数
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        let d = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
        // 确保在有效范围 [1, n-1]
        d = mod(d, this.n - 1n) + 1n;
        return d;
    }

    // 生成密钥对
    generateKeyPair() {
        this.privateKey = this.generatePrivateKey();
        this.publicKey = scalarMult(this.privateKey, this.G);
        return {
            privateKey: this.privateKey,
            publicKey: this.publicKey,
            G: this.G
        };
    }

    // 签名
    sign(message) {
        if (!this.privateKey) throw new Error('No private key');

        // 1. 计算消息哈希
        const hashHex = sha256(message);
        const z = mod(hashToBigInt(hashHex), this.n);

        // 2. 生成随机数 k
        const k = this.generatePrivateKey(); // 使用相同方法生成随机 k

        // 3. 计算 R = k × G
        const R = scalarMult(k, this.G);

        // 4. 计算 r = R.x mod n
        const r = mod(R.x, this.n);
        if (r === 0n) return this.sign(message); // 重试

        // 5. 计算 k 的模逆元
        const kInv = modInverse(k, this.n);

        // 6. 计算 z + r × d
        const rd = modMul(r, this.privateKey, this.n);
        const zPlusRd = modAdd(z, rd, this.n);

        // 7. 计算 s = k⁻¹ × (z + r × d) mod n
        const s = modMul(kInv, zPlusRd, this.n);
        if (s === 0n) return this.sign(message); // 重试

        // 保存中间值用于可视化
        this.signData = {
            message,
            hashHex,
            z,
            k,
            R,
            r,
            kInv,
            rd,
            zPlusRd,
            s
        };

        return { r, s };
    }

    // 验证
    verify(message, signature, publicKey = this.publicKey) {
        const { r, s } = signature;

        // 检查 r, s 范围
        if (r <= 0n || r >= this.n || s <= 0n || s >= this.n) {
            return { valid: false, error: 'Invalid signature range' };
        }

        // 1. 计算消息哈希
        const hashHex = sha256(message);
        const z = mod(hashToBigInt(hashHex), this.n);

        // 2. 计算 s⁻¹
        const sInv = modInverse(s, this.n);

        // 3. 计算 u₁ = z × s⁻¹ mod n
        const u1 = modMul(z, sInv, this.n);

        // 4. 计算 u₂ = r × s⁻¹ mod n
        const u2 = modMul(r, sInv, this.n);

        // 5. 计算 u₁ × G
        const u1G = scalarMult(u1, this.G);

        // 6. 计算 u₂ × Q
        const u2Q = scalarMult(u2, publicKey);

        // 7. 计算 P = u₁ × G + u₂ × Q
        const P = pointAdd(u1G, u2Q);

        if (isInfinity(P)) {
            return { valid: false, error: 'Point at infinity' };
        }

        // 8. 验证 P.x mod n === r
        const Px_mod_n = mod(P.x, this.n);
        const valid = Px_mod_n === r;

        // 保存中间值用于可视化
        this.verifyData = {
            hashHex,
            z,
            sInv,
            u1,
            u2,
            u1G,
            u2Q,
            P,
            Px_mod_n,
            r,
            valid
        };

        return { valid, Px_mod_n, r };
    }
}

// ==========================================
// 显示工具函数
// ==========================================

// 格式化大整数（截断显示）
function formatBigInt(n, maxLen = 20) {
    if (n === null || n === undefined) return '-';
    const hex = n.toString(16);
    if (hex.length <= maxLen) return hex;
    return hex.substring(0, maxLen / 2) + '...' + hex.substring(hex.length - maxLen / 2);
}

// 格式化点坐标
function formatPoint(P) {
    if (isInfinity(P)) return { x: 'Infinity', y: 'Infinity' };
    return {
        x: formatBigInt(P.x),
        y: formatBigInt(P.y)
    };
}

// 动画延迟
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 高亮步骤
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

// ==========================================
// UI 控制
// ==========================================

let ecdsa = null;
let currentSignature = null;

function initECDSADemo() {
    ecdsa = new ECDSAVisualizer();

    // 按钮事件
    const generateBtn = document.getElementById('ecdsa-generate-keys');
    const signBtn = document.getElementById('ecdsa-sign-btn');
    const verifyBtn = document.getElementById('ecdsa-verify-btn');

    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateKeys);
    }

    if (signBtn) {
        signBtn.addEventListener('click', handleSign);
    }

    if (verifyBtn) {
        verifyBtn.addEventListener('click', handleVerify);
    }

    // 步骤导航
    document.querySelectorAll('.ecdsa-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const step = btn.dataset.step;
            showECDSAPanel(step);
            document.querySelectorAll('.ecdsa-step-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 高亮结构图中对应的列
            document.querySelectorAll('.ecdsa-column').forEach(col => col.classList.remove('active-column'));
            const column = document.querySelector(`.ecdsa-column[data-step="${step}"]`);
            if (column) column.classList.add('active-column');
        });
    });
}

async function handleGenerateKeys() {
    const keys = ecdsa.generateKeyPair();

    // 显示过程面板
    const processPanel = document.getElementById('ecdsa-process');
    if (processPanel) {
        processPanel.style.display = 'block';
        processPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 显示密钥生成面板
    showECDSAPanel('keygen');
    document.querySelectorAll('.ecdsa-step-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.ecdsa-step-btn[data-step="keygen"]').classList.add('active');

    // 动画显示各步骤
    await animateKeyGen(keys);

    // 启用签名按钮
    document.getElementById('ecdsa-sign-btn').disabled = false;
}

async function animateKeyGen(keys) {
    // 步骤1：显示私钥
    await sleep(300);
    highlightStep('keygen-step-1', true);
    document.getElementById('display-privkey').textContent = formatBigInt(keys.privateKey);

    // 步骤2：显示生成点
    await sleep(500);
    highlightStep('keygen-step-2', true);
    const Gf = formatPoint(keys.G);
    document.getElementById('display-Gx').textContent = formatBigInt(keys.G.x, 16);
    document.getElementById('display-Gy').textContent = formatBigInt(keys.G.y, 16);

    // 步骤3：显示公钥
    await sleep(500);
    highlightStep('keygen-step-3', true);
    const Qf = formatPoint(keys.publicKey);
    document.getElementById('display-Qx').textContent = formatBigInt(keys.publicKey.x);
    document.getElementById('display-Qy').textContent = formatBigInt(keys.publicKey.y);
}

async function handleSign() {
    const message = document.getElementById('ecdsa-message').value;
    if (!message) return;

    // 执行签名
    currentSignature = ecdsa.sign(message);

    // 显示签名面板
    showECDSAPanel('sign');
    document.querySelectorAll('.ecdsa-step-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.ecdsa-step-btn[data-step="sign"]').classList.add('active');

    // 动画显示各步骤
    await animateSign(ecdsa.signData);

    // 启用验证按钮
    document.getElementById('ecdsa-verify-btn').disabled = false;
}

async function animateSign(data) {
    const steps = [
        'sign-step-1', 'sign-step-2', 'sign-step-3', 'sign-step-4',
        'sign-step-5', 'sign-step-6', 'sign-step-7', 'sign-step-8'
    ];
    steps.forEach(id => highlightStep(id, false));

    // 步骤1：消息
    await sleep(300);
    highlightStep('sign-step-1', true);
    document.getElementById('display-message').textContent =
        data.message.length > 30 ? data.message.substring(0, 30) + '...' : data.message;

    // 步骤2：哈希
    await sleep(400);
    highlightStep('sign-step-2', true);
    document.getElementById('display-hash').textContent = data.hashHex;

    // 步骤3：随机数 k
    await sleep(400);
    highlightStep('sign-step-3', true);
    document.getElementById('display-k').textContent = formatBigInt(data.k);

    // 步骤4：曲线点 R
    await sleep(400);
    highlightStep('sign-step-4', true);
    document.getElementById('display-Rx').textContent = formatBigInt(data.R.x);
    document.getElementById('display-Ry').textContent = formatBigInt(data.R.y);

    // 步骤5：r
    await sleep(400);
    highlightStep('sign-step-5', true);
    document.getElementById('display-sig-r').textContent = formatBigInt(data.r);

    // 步骤6：k 的逆元
    await sleep(400);
    highlightStep('sign-step-6', true);
    document.getElementById('display-k-inv').textContent = formatBigInt(data.kInv);

    // 步骤7：z + r × d
    await sleep(400);
    highlightStep('sign-step-7', true);
    document.getElementById('display-z-plus-rd').textContent = formatBigInt(data.zPlusRd);

    // 步骤8：s
    await sleep(400);
    highlightStep('sign-step-8', true);
    document.getElementById('display-sig-s').textContent = formatBigInt(data.s);

    // 最终签名
    await sleep(300);
    document.getElementById('final-r').textContent = formatBigInt(data.r, 24);
    document.getElementById('final-s').textContent = formatBigInt(data.s, 24);
}

async function handleVerify() {
    if (!currentSignature) return;

    const message = document.getElementById('ecdsa-message').value;

    // 执行验证
    const result = ecdsa.verify(message, currentSignature);

    // 显示验证面板
    showECDSAPanel('verify');
    document.querySelectorAll('.ecdsa-step-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.ecdsa-step-btn[data-step="verify"]').classList.add('active');

    // 动画显示各步骤
    await animateVerify(ecdsa.verifyData);
}

async function animateVerify(data) {
    const steps = [
        'verify-step-1', 'verify-step-2', 'verify-step-3', 'verify-step-4',
        'verify-step-5', 'verify-step-6', 'verify-step-7', 'verify-step-8'
    ];
    steps.forEach(id => highlightStep(id, false));

    // 重置结果
    document.getElementById('verify-compare-icon').textContent = '?';
    document.getElementById('verify-compare-icon').className = 'compare-icon';
    document.getElementById('verify-icon').textContent = '❓';
    document.getElementById('verify-result-box').className = 'verify-result-box';

    // 步骤1：哈希
    await sleep(300);
    highlightStep('verify-step-1', true);
    document.getElementById('verify-display-hash').textContent = data.hashHex;

    // 步骤2：s⁻¹
    await sleep(400);
    highlightStep('verify-step-2', true);
    document.getElementById('display-s-inv').textContent = formatBigInt(data.sInv);

    // 步骤3：u₁
    await sleep(400);
    highlightStep('verify-step-3', true);
    document.getElementById('display-u1').textContent = formatBigInt(data.u1);

    // 步骤4：u₂
    await sleep(400);
    highlightStep('verify-step-4', true);
    document.getElementById('display-u2').textContent = formatBigInt(data.u2);

    // 步骤5：u₁ × G
    await sleep(400);
    highlightStep('verify-step-5', true);
    document.getElementById('display-u1Gx').textContent = formatBigInt(data.u1G.x);
    document.getElementById('display-u1Gy').textContent = formatBigInt(data.u1G.y);

    // 步骤6：u₂ × Q
    await sleep(400);
    highlightStep('verify-step-6', true);
    document.getElementById('display-u2Qx').textContent = formatBigInt(data.u2Q.x);
    document.getElementById('display-u2Qy').textContent = formatBigInt(data.u2Q.y);

    // 步骤7：P
    await sleep(400);
    highlightStep('verify-step-7', true);
    document.getElementById('display-Px').textContent = formatBigInt(data.P.x);
    document.getElementById('display-Py').textContent = formatBigInt(data.P.y);

    // 步骤8：比较
    await sleep(400);
    highlightStep('verify-step-8', true);
    document.getElementById('display-Px-mod-n').textContent = formatBigInt(data.Px_mod_n);
    document.getElementById('display-r-verify').textContent = formatBigInt(data.r);

    // 比较结果
    await sleep(500);
    const compareIcon = document.getElementById('verify-compare-icon');
    const resultBox = document.getElementById('verify-result-box');
    const verifyIcon = document.getElementById('verify-icon');
    const verifyText = document.getElementById('verify-text');

    if (data.valid) {
        compareIcon.textContent = '=';
        compareIcon.classList.add('match');
        verifyIcon.textContent = '✅';
        verifyText.textContent = typeof t === 'function' ? t('ecdsa.verify.valid') : '签名有效！';
        resultBox.classList.add('success');
    } else {
        compareIcon.textContent = '≠';
        compareIcon.classList.add('mismatch');
        verifyIcon.textContent = '❌';
        verifyText.textContent = typeof t === 'function' ? t('ecdsa.verify.invalid') : '签名无效！';
        resultBox.classList.add('error');
    }
}

function showECDSAPanel(step) {
    // 隐藏所有面板
    document.querySelectorAll('.ecdsa-panel').forEach(p => p.style.display = 'none');

    // 显示对应面板
    const panel = document.getElementById(`${step}-panel`);
    if (panel) {
        panel.style.display = 'block';
    }

    // 高亮结构图中的列
    document.querySelectorAll('.ecdsa-column').forEach(col => col.classList.remove('active-column'));
    const column = document.querySelector(`.ecdsa-column[data-step="${step}"]`);
    if (column) column.classList.add('active-column');
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initECDSADemo);
