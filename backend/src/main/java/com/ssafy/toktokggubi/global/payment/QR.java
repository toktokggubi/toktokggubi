package com.ssafy.toktokggubi.global.payment;

import com.google.zxing.*;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;

import java.io.ByteArrayOutputStream;
import java.util.Map;

public class QR {
    public static byte[] pngFor(String json, int size) throws Exception {
        BitMatrix m = new QRCodeWriter().encode(json, BarcodeFormat.QR_CODE, size, size,
                Map.of(EncodeHintType.CHARACTER_SET, "UTF-8", EncodeHintType.MARGIN, 1));
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(m, "PNG", out);
        return out.toByteArray();
    }
}

