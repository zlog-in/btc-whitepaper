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

// SHA-256 返回字节数组
function sha256Bytes(message) {
    const hex = sha256(message);
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
}

// ==========================================
// RIPEMD-160 简化实现（教学用途）
// ==========================================
function ripemd160(bytes) {
    function leftRotate(x, n) {
        return ((x << n) | (x >>> (32 - n))) >>> 0;
    }

    function f(j, x, y, z) {
        if (j < 16) return x ^ y ^ z;
        if (j < 32) return (x & y) | (~x & z);
        if (j < 48) return (x | ~y) ^ z;
        if (j < 64) return (x & z) | (y & ~z);
        return x ^ (y | ~z);
    }

    const K = [0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
    const KK = [0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

    const r = [
        0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
        7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,
        3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,
        1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,
        4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13
    ];
    const rr = [
        5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,
        6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,
        15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,
        8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,
        12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11
    ];
    const s = [
        11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,
        7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,
        11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,
        11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,
        9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6
    ];
    const ss = [
        8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,
        9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,
        9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,
        15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,
        8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11
    ];

    const msg = [...bytes];
    const bitLength = bytes.length * 8;
    msg.push(0x80);
    while ((msg.length % 64) !== 56) msg.push(0);

    for (let i = 0; i < 8; i++) {
        msg.push((bitLength >>> (i * 8)) & 0xff);
    }

    let h0 = 0x67452301;
    let h1 = 0xEFCDAB89;
    let h2 = 0x98BADCFE;
    let h3 = 0x10325476;
    let h4 = 0xC3D2E1F0;

    for (let block = 0; block < msg.length; block += 64) {
        const x = [];
        for (let i = 0; i < 16; i++) {
            x[i] = msg[block + i*4] | (msg[block + i*4 + 1] << 8) |
                   (msg[block + i*4 + 2] << 16) | (msg[block + i*4 + 3] << 24);
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
        h1 = (h2 + d + ee) >>> 0;
        h2 = (h3 + e + aa) >>> 0;
        h3 = (h4 + a + bb) >>> 0;
        h4 = (h0 + b + cc) >>> 0;
        h0 = t;
    }

    const result = [];
    [h0, h1, h2, h3, h4].forEach(h => {
        result.push(h & 0xff);
        result.push((h >>> 8) & 0xff);
        result.push((h >>> 16) & 0xff);
        result.push((h >>> 24) & 0xff);
    });

    return result.map(b => ('0' + b.toString(16)).slice(-2)).join('');
}

// ==========================================
// Base58Check 编码
// ==========================================
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(bytes) {
    let leadingZeros = 0;
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
        leadingZeros++;
    }

    let num = BigInt(0);
    for (let i = 0; i < bytes.length; i++) {
        num = num * BigInt(256) + BigInt(bytes[i]);
    }

    let result = '';
    while (num > 0) {
        const remainder = num % BigInt(58);
        num = num / BigInt(58);
        result = BASE58_ALPHABET[Number(remainder)] + result;
    }

    for (let i = 0; i < leadingZeros; i++) {
        result = '1' + result;
    }

    return result;
}

function base58Decode(str) {
    let leadingOnes = 0;
    for (let i = 0; i < str.length && str[i] === '1'; i++) {
        leadingOnes++;
    }

    let num = BigInt(0);
    for (let i = 0; i < str.length; i++) {
        const idx = BASE58_ALPHABET.indexOf(str[i]);
        if (idx === -1) return null;
        num = num * BigInt(58) + BigInt(idx);
    }

    const bytes = [];
    while (num > 0) {
        bytes.unshift(Number(num % BigInt(256)));
        num = num / BigInt(256);
    }

    for (let i = 0; i < leadingOnes; i++) {
        bytes.unshift(0);
    }

    return bytes;
}

function base58Check(payload, version = 0x00) {
    const versionedPayload = [version, ...payload];
    const firstHash = sha256Bytes(versionedPayload);
    const secondHash = sha256Bytes(firstHash);
    const checksum = secondHash.slice(0, 4);
    const finalBytes = [...versionedPayload, ...checksum];
    return base58Encode(finalBytes);
}

// ==========================================
// Bech32 / Bech32m 编码（用于 SegWit 和 Taproot 地址）
// ==========================================
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const BECH32_CONST = 1;      // Bech32
const BECH32M_CONST = 0x2bc830a3;  // Bech32m

function bech32Polymod(values) {
    const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (const v of values) {
        const top = chk >> 25;
        chk = ((chk & 0x1ffffff) << 5) ^ v;
        for (let i = 0; i < 5; i++) {
            if ((top >> i) & 1) {
                chk ^= GEN[i];
            }
        }
    }
    return chk;
}

function bech32HrpExpand(hrp) {
    const ret = [];
    for (let i = 0; i < hrp.length; i++) {
        ret.push(hrp.charCodeAt(i) >> 5);
    }
    ret.push(0);
    for (let i = 0; i < hrp.length; i++) {
        ret.push(hrp.charCodeAt(i) & 31);
    }
    return ret;
}

function bech32CreateChecksum(hrp, data, spec) {
    const values = bech32HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
    const polymod = bech32Polymod(values) ^ spec;
    const ret = [];
    for (let i = 0; i < 6; i++) {
        ret.push((polymod >> (5 * (5 - i))) & 31);
    }
    return ret;
}

function bech32Encode(hrp, data, spec = BECH32_CONST) {
    const combined = data.concat(bech32CreateChecksum(hrp, data, spec));
    let result = hrp + '1';
    for (const d of combined) {
        result += BECH32_CHARSET[d];
    }
    return result;
}

// 将字节数组转换为 5-bit 数组
function convertBits(data, fromBits, toBits, pad = true) {
    let acc = 0;
    let bits = 0;
    const ret = [];
    const maxv = (1 << toBits) - 1;

    for (const value of data) {
        acc = (acc << fromBits) | value;
        bits += fromBits;
        while (bits >= toBits) {
            bits -= toBits;
            ret.push((acc >> bits) & maxv);
        }
    }

    if (pad) {
        if (bits > 0) {
            ret.push((acc << (toBits - bits)) & maxv);
        }
    } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
        return null;
    }

    return ret;
}

// 生成 Bech32 地址（P2WPKH - SegWit v0）
function createP2WPKHAddress(pubkeyHash) {
    const witnessVersion = 0;
    const data = [witnessVersion].concat(convertBits(pubkeyHash, 8, 5));
    return bech32Encode('bc', data, BECH32_CONST);
}

// 生成 Bech32m 地址（P2TR - Taproot）
function createP2TRAddress(pubkeyX) {
    const witnessVersion = 1;
    const data = [witnessVersion].concat(convertBits(pubkeyX, 8, 5));
    return bech32Encode('bc', data, BECH32M_CONST);
}

// ==========================================
// 地址类型配置
// ==========================================
const ADDRESS_TYPES = {
    p2pkh: {
        name: 'P2PKH',
        fullName: 'Pay-to-Public-Key-Hash',
        prefix: '1',
        encoding: 'Base58Check',
        version: '0x00',
        descKey: 'addr.type.p2pkh.note'
    },
    p2sh: {
        name: 'P2SH',
        fullName: 'Pay-to-Script-Hash',
        prefix: '3',
        encoding: 'Base58Check',
        version: '0x05',
        descKey: 'addr.type.p2sh.note'
    },
    p2wpkh: {
        name: 'P2WPKH',
        fullName: 'Pay-to-Witness-Public-Key-Hash',
        prefix: 'bc1q',
        encoding: 'Bech32',
        version: 'v0',
        descKey: 'addr.type.p2wpkh.note'
    },
    p2tr: {
        name: 'P2TR',
        fullName: 'Pay-to-Taproot',
        prefix: 'bc1p',
        encoding: 'Bech32m',
        version: 'v1',
        descKey: 'addr.type.p2tr.note'
    }
};

// 当前选择的地址类型
let selectedAddressType = 'p2pkh';

// ==========================================
// 地址验证
// ==========================================
function validateAddress(address) {
    if (address.length < 14 || address.length > 74) {
        return { valid: false, error: 'invalid_length' };
    }

    // Bech32/Bech32m 地址
    if (address.toLowerCase().startsWith('bc1')) {
        const lowerAddress = address.toLowerCase();

        // 检查字符集
        for (let i = 4; i < lowerAddress.length; i++) {
            if (!BECH32_CHARSET.includes(lowerAddress[i])) {
                return { valid: false, error: 'invalid_bech32' };
            }
        }

        // 判断是 P2WPKH (bc1q) 还是 P2TR (bc1p)
        let type, witnessVersion;
        if (lowerAddress.startsWith('bc1q')) {
            type = 'P2WPKH (Native SegWit v0)';
            witnessVersion = 'v0';
        } else if (lowerAddress.startsWith('bc1p')) {
            type = 'P2TR (Taproot v1)';
            witnessVersion = 'v1';
        } else {
            type = 'Bech32 (Unknown)';
            witnessVersion = 'unknown';
        }

        return {
            valid: true,
            type,
            version: witnessVersion,
            hash: lowerAddress.slice(4, -6),
            checksum: lowerAddress.slice(-6)
        };
    }

    // Base58Check 地址
    const firstChar = address[0];
    if (!['1', '3'].includes(firstChar)) {
        return { valid: false, error: 'invalid_prefix' };
    }

    const decoded = base58Decode(address);
    if (!decoded || decoded.length !== 25) {
        return { valid: false, error: 'decode_failed' };
    }

    const version = decoded[0];
    const hash = decoded.slice(1, 21);
    const checksum = decoded.slice(21);

    const versionedPayload = decoded.slice(0, 21);
    const firstHash = sha256Bytes(versionedPayload);
    const secondHash = sha256Bytes(firstHash);
    const expectedChecksum = secondHash.slice(0, 4);

    const checksumValid = checksum.every((b, i) => b === expectedChecksum[i]);

    if (!checksumValid) {
        return { valid: false, error: 'invalid_checksum' };
    }

    let type;
    if (version === 0x00) type = 'P2PKH (Legacy)';
    else if (version === 0x05) type = 'P2SH (Script Hash)';
    else type = 'Unknown';

    return {
        valid: true,
        type,
        version: '0x' + version.toString(16).padStart(2, '0'),
        hash: hash.map(b => b.toString(16).padStart(2, '0')).join(''),
        checksum: checksum.map(b => b.toString(16).padStart(2, '0')).join('')
    };
}

// ==========================================
// 辅助函数
// ==========================================
function randomHex(length) {
    let result = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
}

function hexToBytes(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
}

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
const generateBtn = document.getElementById('generate-address');
const validateBtn = document.getElementById('validate-btn');
const validateInput = document.getElementById('validate-input');
const validateResult = document.getElementById('validate-result');
const addressBreakdown = document.getElementById('address-breakdown');
const addressProcess = document.getElementById('address-process');
const addressOutput = document.getElementById('address-output');

// 地址类型选择器
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAddressType = btn.dataset.type;

        // 隐藏之前的结果
        addressProcess.style.display = 'none';
        addressOutput.style.display = 'none';
    });
});

// 生成地址（带动画）
generateBtn.addEventListener('click', async () => {
    generateBtn.disabled = true;
    const addrType = ADDRESS_TYPES[selectedAddressType];

    // 重置并显示过程
    addressProcess.style.display = 'block';
    addressOutput.style.display = 'none';
    ['addr-step-1', 'addr-step-2', 'addr-step-3', 'addr-step-4', 'addr-step-5'].forEach(id => highlightStep(id, false));
    ['addr-arrow-1', 'addr-arrow-2', 'addr-arrow-3', 'addr-arrow-4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    // 重置所有值
    document.getElementById('addr-privkey-value').textContent = '-';
    document.getElementById('addr-pubkey-value').textContent = '-';
    document.getElementById('addr-sha256-value').textContent = '-';
    document.getElementById('addr-ripemd-value').textContent = '-';
    document.getElementById('addr-final-value').textContent = '-';

    // 更新编码标签
    const encodingLabel = document.getElementById('addr-encoding-label');
    encodingLabel.textContent = addrType.encoding + ' ' + (typeof t === 'function' ? t('addr.step.encode') : '编码');

    // 步骤1：生成私钥
    await sleep(300);
    highlightStep('addr-step-1', true);
    const privateKey = randomHex(64);
    document.getElementById('addr-privkey-value').textContent = privateKey;

    // 箭头1
    await sleep(400);
    showArrow('addr-arrow-1');

    // 步骤2：生成公钥
    await sleep(400);
    highlightStep('addr-step-2', true);
    let publicKey;
    if (selectedAddressType === 'p2tr') {
        // Taproot 使用 32 字节的 x-only 公钥
        publicKey = sha256('pubkey:' + privateKey);
    } else {
        // 其他类型使用完整的非压缩公钥（04 前缀 + x + y）
        publicKey = '04' + sha256('pubkey:' + privateKey) + sha256('pubkey2:' + privateKey);
    }
    document.getElementById('addr-pubkey-value').textContent = publicKey;

    // 箭头2
    await sleep(400);
    showArrow('addr-arrow-2');

    // 步骤3：SHA-256
    await sleep(400);
    highlightStep('addr-step-3', true);
    const sha256Hash = sha256(publicKey);
    document.getElementById('addr-sha256-value').textContent = sha256Hash;

    // 箭头3
    await sleep(400);
    showArrow('addr-arrow-3');

    // 步骤4：RIPEMD-160 或直接使用 SHA256（Taproot）
    await sleep(400);
    highlightStep('addr-step-4', true);
    let hashForAddress;
    if (selectedAddressType === 'p2tr') {
        // Taproot 直接使用公钥的 x 坐标（已经是 32 字节）
        hashForAddress = publicKey;
        document.getElementById('addr-ripemd-value').textContent = hashForAddress + ' (x-only pubkey)';
    } else {
        hashForAddress = ripemd160(hexToBytes(sha256Hash));
        document.getElementById('addr-ripemd-value').textContent = hashForAddress;
    }

    // 箭头4
    await sleep(400);
    showArrow('addr-arrow-4');

    // 步骤5：编码生成最终地址
    await sleep(400);
    highlightStep('addr-step-5', true);

    let address;
    switch (selectedAddressType) {
        case 'p2pkh':
            address = base58Check(hexToBytes(hashForAddress), 0x00);
            break;
        case 'p2sh':
            // P2SH: 先创建赎回脚本的哈希
            const redeemScriptHash = ripemd160(hexToBytes(sha256Hash));
            address = base58Check(hexToBytes(redeemScriptHash), 0x05);
            break;
        case 'p2wpkh':
            address = createP2WPKHAddress(hexToBytes(hashForAddress));
            break;
        case 'p2tr':
            address = createP2TRAddress(hexToBytes(hashForAddress));
            break;
    }
    document.getElementById('addr-final-value').textContent = address;

    // 显示结果
    await sleep(300);
    addressOutput.style.display = 'block';
    document.getElementById('generated-address').textContent = address;

    // 更新类型信息
    const typeBadge = document.getElementById('type-badge');
    const typeDesc = document.getElementById('type-desc');
    typeBadge.textContent = addrType.name;
    typeBadge.className = 'type-badge ' + selectedAddressType;

    const descTexts = {
        p2pkh: typeof t === 'function' ? t('addr.type.p2pkh.note') : '以 "1" 开头的传统地址，最广泛支持的格式',
        p2sh: typeof t === 'function' ? t('addr.type.p2sh.note') : '以 "3" 开头，支持多重签名和复杂脚本',
        p2wpkh: typeof t === 'function' ? t('addr.type.p2wpkh.note') : '以 "bc1q" 开头的原生隔离见证地址，手续费更低',
        p2tr: typeof t === 'function' ? t('addr.type.p2tr.note') : '以 "bc1p" 开头的 Taproot 地址，隐私性和效率最佳'
    };
    typeDesc.textContent = descTexts[selectedAddressType];

    generateBtn.disabled = false;
});

// 验证地址
validateBtn.addEventListener('click', () => {
    const address = validateInput.value.trim();

    if (!address) {
        validateResult.innerHTML = `<span class="result-error">${typeof t === 'function' ? t('addr.validate.enter') : '请输入地址'}</span>`;
        addressBreakdown.style.display = 'none';
        return;
    }

    const result = validateAddress(address);

    if (result.valid) {
        validateResult.innerHTML = `<span class="result-success">✅ ${typeof t === 'function' ? t('addr.validate.valid') : '地址格式有效'} (${result.type})</span>`;
        addressBreakdown.style.display = 'block';
        document.getElementById('breakdown-version').textContent = result.version;
        document.getElementById('breakdown-hash').textContent = result.hash;
        document.getElementById('breakdown-checksum').textContent = result.checksum;
    } else {
        let errorMsg;
        switch (result.error) {
            case 'invalid_length':
                errorMsg = typeof t === 'function' ? t('addr.error.length') : '地址长度无效';
                break;
            case 'invalid_prefix':
                errorMsg = typeof t === 'function' ? t('addr.error.prefix') : '地址前缀无效';
                break;
            case 'decode_failed':
                errorMsg = typeof t === 'function' ? t('addr.error.decode') : '地址解码失败';
                break;
            case 'invalid_checksum':
                errorMsg = typeof t === 'function' ? t('addr.error.checksum') : '校验和无效';
                break;
            case 'invalid_bech32':
                errorMsg = typeof t === 'function' ? t('addr.error.bech32') : 'Bech32 字符无效';
                break;
            default:
                errorMsg = typeof t === 'function' ? t('addr.error.unknown') : '未知错误';
        }
        validateResult.innerHTML = `<span class="result-error">❌ ${errorMsg}</span>`;
        addressBreakdown.style.display = 'none';
    }
});

// 输入变化时清除结果
validateInput.addEventListener('input', () => {
    validateResult.innerHTML = '';
    addressBreakdown.style.display = 'none';
});

// ==========================================
// P2SH 脚本地址生成演示
// ==========================================

// 将数字编码为最小脚本push格式
function encodeScriptNum(num) {
    if (num === 0) return '00';
    if (num >= 1 && num <= 16) return (0x50 + num).toString(16);

    // 将数字编码为小端字节
    const bytes = [];
    let n = num;
    while (n > 0) {
        bytes.push(n & 0xff);
        n = n >> 8;
    }
    // 如果最高位设置了，需要添加0x00防止被解释为负数
    if (bytes.length > 0 && (bytes[bytes.length - 1] & 0x80)) {
        bytes.push(0x00);
    }
    const lenHex = bytes.length.toString(16).padStart(2, '0');
    const bytesHex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    return lenHex + bytesHex;
}

// 构建多签赎回脚本
function buildMultisigRedeemScript(m, pubKeys) {
    let script = '';
    // OP_M
    script += (0x50 + m).toString(16);
    // 压入每个公钥
    for (const pk of pubKeys) {
        script += '21'; // PUSH 33 bytes
        script += pk;
    }
    // OP_N
    script += (0x50 + pubKeys.length).toString(16);
    // OP_CHECKMULTISIG
    script += 'ae';
    return script;
}

// 构建时间锁赎回脚本
function buildTimelockRedeemScript(lockHeight, pubKey) {
    let script = '';
    // <lockHeight>
    script += encodeScriptNum(lockHeight);
    // OP_CHECKLOCKTIMEVERIFY
    script += 'b1';
    // OP_DROP
    script += '75';
    // <pubKey>
    script += '21' + pubKey;
    // OP_CHECKSIG
    script += 'ac';
    return script;
}

// 构建 HTLC 赎回脚本
function buildHTLCRedeemScript(hashLock, receiverPubKey, senderPubKey, timeout) {
    let script = '';
    // OP_IF
    script += '63';
    // OP_HASH160
    script += 'a9';
    // <hashLock> (20 bytes)
    script += '14' + hashLock;
    // OP_EQUALVERIFY
    script += '88';
    // <receiverPubKey>
    script += '21' + receiverPubKey;
    // OP_ELSE
    script += '67';
    // <timeout>
    script += encodeScriptNum(timeout);
    // OP_CHECKLOCKTIMEVERIFY
    script += 'b1';
    // OP_DROP
    script += '75';
    // <senderPubKey>
    script += '21' + senderPubKey;
    // OP_ENDIF
    script += '68';
    // OP_CHECKSIG
    script += 'ac';
    return script;
}

// HASH160 = RIPEMD160(SHA256(data))
function hash160(hexData) {
    const sha256Hash = sha256Bytes(hexToBytes(hexData));
    return ripemd160(sha256Hash);
}

// 生成 P2SH 地址
function createP2SHAddress(redeemScriptHex) {
    const scriptHash = hash160(redeemScriptHex);
    return base58Check(hexToBytes(scriptHash), 0x05);
}

// ==========================================
// 固定的示例数据（用于演示真实脚本生成过程）
// ==========================================
const EXAMPLE_DATA = {
    // 2-of-3 多签示例的三个公钥
    multisig: {
        pubKeyA: '021e8f5c7a3b9d2e4f6c8a0b1d3e5f7a9c2b4d6e8f0a1c3e5d7b9a0c2e4f6a8b0d',
        pubKeyB: '037d2a9b1c4e6f8d0a2c4e6f8a0b2d4e6f8a0c2e4d6b8a0c2e4f6d8a0b2c4e6f8a',
        pubKeyC: '029cf4d82a6b8e0c2d4f6a8c0e2b4d6f8a0c2e4d6b8f0a2c4e6d8b0a2c4e6f8a0c'
    },
    // 时间锁示例
    timelock: {
        pubKey: '023ab8d7e5f6c9a1b3d5e7f9a0c2b4d6e8f0a2c4e6b8d0a2c4f6e8a0b2d4c6e8f0',
        lockHeight: 850000
    },
    // HTLC 示例
    htlc: {
        alicePubKey: '025c8e3d7f9a1b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d',
        bobPubKey: '03a1f7b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0',
        secret: '7365637265745f70726569696d6167655f666f725f68746c635f64656d6f5f31',  // "secret_preimage_for_htlc_demo_1" in hex
        timeout: 144
    }
};

// ==========================================
// 多签实例演示
// ==========================================
const runMultisigExample = document.getElementById('run-multisig-example');

if (runMultisigExample) {
    runMultisigExample.addEventListener('click', async () => {
        runMultisigExample.disabled = true;
        runMultisigExample.textContent = '⏳ ...';

        const { pubKeyA, pubKeyB, pubKeyC } = EXAMPLE_DATA.multisig;
        const pubKeys = [pubKeyA, pubKeyB, pubKeyC];

        // 步骤3：构建脚本并计算 HASH160
        await sleep(300);
        const redeemScript = buildMultisigRedeemScript(2, pubKeys);
        const scriptHash = hash160(redeemScript);
        document.getElementById('multisig-example-hash').textContent = scriptHash;
        document.getElementById('multisig-example-hash').classList.add('highlight-animated');

        // 步骤4：生成 P2SH 地址
        await sleep(500);
        const address = createP2SHAddress(redeemScript);
        document.getElementById('multisig-example-addr').textContent = address;
        document.getElementById('multisig-example-addr').classList.add('highlight-animated');

        runMultisigExample.textContent = typeof t === 'function' ? t('addr.p2sh.run') : '▶ 运行实例';
        runMultisigExample.disabled = false;
    });
}

// ==========================================
// 时间锁实例演示
// ==========================================
const runTimelockExample = document.getElementById('run-timelock-example');

if (runTimelockExample) {
    runTimelockExample.addEventListener('click', async () => {
        runTimelockExample.disabled = true;
        runTimelockExample.textContent = '⏳ ...';

        const { pubKey, lockHeight } = EXAMPLE_DATA.timelock;

        // 步骤3：构建脚本并计算 HASH160
        await sleep(300);
        const redeemScript = buildTimelockRedeemScript(lockHeight, pubKey);
        const scriptHash = hash160(redeemScript);
        document.getElementById('timelock-example-hash').textContent = scriptHash;
        document.getElementById('timelock-example-hash').classList.add('highlight-animated');

        // 步骤4：生成 P2SH 地址
        await sleep(500);
        const address = createP2SHAddress(redeemScript);
        document.getElementById('timelock-example-addr').textContent = address;
        document.getElementById('timelock-example-addr').classList.add('highlight-animated');

        runTimelockExample.textContent = typeof t === 'function' ? t('addr.p2sh.run') : '▶ 运行实例';
        runTimelockExample.disabled = false;
    });
}

// ==========================================
// HTLC 实例演示
// ==========================================
const runHTLCExample = document.getElementById('run-htlc-example');

if (runHTLCExample) {
    runHTLCExample.addEventListener('click', async () => {
        runHTLCExample.disabled = true;
        runHTLCExample.textContent = '⏳ ...';

        const { alicePubKey, bobPubKey, secret, timeout } = EXAMPLE_DATA.htlc;

        // 计算哈希锁 (HASH160 of secret)
        await sleep(200);
        const hashLock = hash160(secret);
        document.getElementById('htlc-example-hashlock').textContent = hashLock.slice(0, 12) + '...';
        document.getElementById('htlc-example-hashlock').classList.add('highlight-animated');

        // 步骤3：构建脚本并计算 HASH160
        await sleep(400);
        const redeemScript = buildHTLCRedeemScript(hashLock, bobPubKey, alicePubKey, timeout);
        const scriptHash = hash160(redeemScript);
        document.getElementById('htlc-example-hash').textContent = scriptHash;
        document.getElementById('htlc-example-hash').classList.add('highlight-animated');

        // 步骤4：生成 P2SH 地址
        await sleep(500);
        const address = createP2SHAddress(redeemScript);
        document.getElementById('htlc-example-addr').textContent = address;
        document.getElementById('htlc-example-addr').classList.add('highlight-animated');

        runHTLCExample.textContent = typeof t === 'function' ? t('addr.p2sh.run') : '▶ 运行实例';
        runHTLCExample.disabled = false;
    });
}

})();
