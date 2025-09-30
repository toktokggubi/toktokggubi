package com.ssafy.toktokggubi.global.file;

import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
public class FileStorage {
    private final Path root;
    private final String gifticonDir;
    private final Tika tika = new Tika();

    public FileStorage(@Value("${app.upload.base-dir:uploads}") String baseDir,
                       @Value("${app.upload.gifticon-dir:gifticon}") String gifticonDir) throws Exception {
        this.root = Paths.get(baseDir).toAbsolutePath().normalize();
        this.gifticonDir = gifticonDir;
        Files.createDirectories(root.resolve(gifticonDir));
    }

    public SavedFile saveGifticon(MultipartFile file) throws Exception {
        String mime = tika.detect(file.getBytes());
        String ext = switch (mime) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "이미지 파일만 업로드할 수 있습니다(jpg, png, webp).");
        };

        String filename = UUID.randomUUID().toString().replace("-", "") + ext;
        Path target = root.resolve(gifticonDir).resolve(filename);
        Files.createDirectories(target.getParent());
        Files.write(target, file.getBytes());

        // DB에는 이 URL을 저장 -> 프론트는 그대로 요청해서 표시
        String url = "/images/" + gifticonDir + "/" + filename;
        return new SavedFile(filename, url, target);
    }

    public record SavedFile(String filename, String url, Path path) {
    }
}
