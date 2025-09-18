package com.ssafy.toktokggubi.global.ocr;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.ocr.provider", havingValue = "vision", matchIfMissing = true)
public class VisionOcrClient implements OcrClient {

    @Value("${app.ocr.credentials-path:}")
    private String credentialsPath;

    @Override
    public String extractText(byte[] imageBytes) throws Exception {
        var settingsBuilder = com.google.cloud.vision.v1.ImageAnnotatorSettings.newBuilder();

        // credentials-path가 있으면 직접 주입, 없으면 ADC(환경변수 등) 사용
        if (credentialsPath != null && !credentialsPath.isBlank()) {
            try (var in = java.nio.file.Files.newInputStream(java.nio.file.Path.of(credentialsPath))) {
                var creds = com.google.auth.oauth2.GoogleCredentials.fromStream(in)
                        .createScoped(java.util.List.of("https://www.googleapis.com/auth/cloud-platform"));
                settingsBuilder.setCredentialsProvider(
                        com.google.api.gax.core.FixedCredentialsProvider.create(creds));
            }
        }

        try (var client = com.google.cloud.vision.v1.ImageAnnotatorClient.create(settingsBuilder.build())) {
            var img = com.google.cloud.vision.v1.Image.newBuilder()
                    .setContent(com.google.protobuf.ByteString.copyFrom(imageBytes))
                    .build();
            var feat = com.google.cloud.vision.v1.Feature.newBuilder()
                    .setType(com.google.cloud.vision.v1.Feature.Type.TEXT_DETECTION)
                    .build();
            var req = com.google.cloud.vision.v1.AnnotateImageRequest.newBuilder()
                    .addFeatures(feat).setImage(img).build();

            var res = client.batchAnnotateImages(java.util.List.of(req)).getResponses(0);
            if (res.hasError()) throw new IllegalStateException("OCR error: " + res.getError().getMessage());
            // 첫번째(전체 블록)만 반환
            return res.getTextAnnotationsList().isEmpty()
                    ? ""
                    : res.getTextAnnotationsList().get(0).getDescription();
        }
    }
}
