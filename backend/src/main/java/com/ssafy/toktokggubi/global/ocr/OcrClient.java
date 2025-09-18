package com.ssafy.toktokggubi.global.ocr;

public interface OcrClient {
    String extractText(byte[] imageBytes) throws Exception;
}