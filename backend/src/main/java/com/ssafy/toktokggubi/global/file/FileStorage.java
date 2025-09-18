package com.ssafy.toktokggubi.global.file;

import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

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
            case "image/png"  -> ".png";
            case "image/webp" -> ".webp";
            default -> ".bin";
        };
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;
        Path target = root.resolve(gifticonDir).resolve(filename);
        Files.write(target, file.getBytes());

        // URL은 /images/** 로 매핑됨 (FileStorageConfig)
        String url = "/images/" + gifticonDir + "/" + filename;
        return new SavedFile(filename, url, target);
    }

    public record SavedFile(String filename, String url, Path path) {}
}