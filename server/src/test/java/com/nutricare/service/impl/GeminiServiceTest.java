package com.nutricare.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricare.exception.GeminiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeminiServiceTest {

    private GeminiService geminiService;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
        geminiService = new GeminiService(mock(WebClient.class), objectMapper);
        setField(geminiService, "geminiApiKey", "test-api-key");
        setField(geminiService, "textApiUrl", "https://test.gemini.com/v1/models/gemini-flash:generateContent");
        setField(geminiService, "visionApiUrl", "https://test.gemini.com/v1/models/gemini-pro-vision:generateContent");
    }

    private void setField(Object target, String name, String value) {
        try {
            java.lang.reflect.Field f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void callText_shouldThrowGeminiException_onNetworkError() {
        WebClient webClient = mock(WebClient.class);
        when(webClient.post()).thenThrow(new RuntimeException("Connection refused"));
        try {
            java.lang.reflect.Field f = GeminiService.class.getDeclaredField("webClient");
            f.setAccessible(true);
            f.set(geminiService, webClient);
        } catch (Exception e) { throw new RuntimeException(e); }

        assertThrows(GeminiException.class, () -> geminiService.callText("Test prompt"));
    }

    @Test
    void callVision_shouldThrowGeminiException_onNetworkError() {
        WebClient webClient = mock(WebClient.class);
        when(webClient.post()).thenThrow(new RuntimeException("Vision API error"));
        try {
            java.lang.reflect.Field f = GeminiService.class.getDeclaredField("webClient");
            f.setAccessible(true);
            f.set(geminiService, webClient);
        } catch (Exception e) { throw new RuntimeException(e); }

        assertThrows(GeminiException.class, () -> geminiService.callVision("base64img", "Test prompt"));
    }

    @Test
    void callText_shouldParseSuccessResponse() {
        String mockResponse = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"Hasil analisis dari Gemini\"}]}}]}";

        WebClient.RequestBodyUriSpec uriSpec = mock(WebClient.RequestBodyUriSpec.class);
        WebClient.RequestBodySpec bodySpec = mock(WebClient.RequestBodySpec.class);
        WebClient.RequestHeadersSpec headersSpec = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);

        WebClient webClient = mock(WebClient.class);
        when(webClient.post()).thenReturn(uriSpec);
        when(uriSpec.uri(anyString())).thenReturn(bodySpec);
        when(bodySpec.contentType(any())).thenReturn(bodySpec);
        when(bodySpec.bodyValue(any())).thenReturn(headersSpec);
        when(headersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));

        try {
            java.lang.reflect.Field f = GeminiService.class.getDeclaredField("webClient");
            f.setAccessible(true);
            f.set(geminiService, webClient);
        } catch (Exception e) { throw new RuntimeException(e); }

        String result = geminiService.callText("Test prompt");

        assertNotNull(result);
        assertEquals("Hasil analisis dari Gemini", result);
    }

    @Test
    void callVision_shouldParseSuccessResponse() {
        String mockResponse = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"Analisis gambar selesai\"}]}}]}";

        @SuppressWarnings("rawtypes")
        WebClient.RequestBodyUriSpec uriSpec = mock(WebClient.RequestBodyUriSpec.class);
        WebClient.RequestBodySpec bodySpec = mock(WebClient.RequestBodySpec.class);
        WebClient.RequestHeadersSpec headersSpec = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);

        WebClient webClient = mock(WebClient.class);
        when(webClient.post()).thenReturn(uriSpec);
        when(uriSpec.uri(anyString())).thenReturn(bodySpec);
        when(bodySpec.contentType(any())).thenReturn(bodySpec);
        when(bodySpec.bodyValue(any())).thenReturn(headersSpec);
        when(headersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(mockResponse));

        try {
            java.lang.reflect.Field f = GeminiService.class.getDeclaredField("webClient");
            f.setAccessible(true);
            f.set(geminiService, webClient);
        } catch (Exception e) { throw new RuntimeException(e); }

        String result = geminiService.callVision("base64img", "Test prompt");

        assertNotNull(result);
        assertEquals("Analisis gambar selesai", result);
    }
}
