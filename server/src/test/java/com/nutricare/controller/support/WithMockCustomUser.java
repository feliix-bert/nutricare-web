package com.nutricare.controller.support;

import com.nutricare.domain.enums.Role;
import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.*;

/**
 * Custom {@code @WithMockCustomUser} untuk meng-inject User entity sebagai
 * {@link org.springframework.security.core.annotation.AuthenticationPrincipal}
 * di controller tests.
 * <p>
 * {@code @WithMockUser} dari Spring Security tidak bisa dipakai karena
 * {@link com.nutricare.domain.entity.User} langsung implements {@code UserDetails}
 * dan di-inject via {@code @AuthenticationPrincipal User user}.
 * <p>
 * Usage:
 * <pre>{@code
 * @WithMockCustomUser(role = Role.PARENT)
 * @Test
 * void someTest() { ... }
 * }</pre>
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@WithSecurityContext(factory = WithMockCustomUserSecurityContextFactory.class)
public @interface WithMockCustomUser {

    /** Role user — default PARENT. */
    Role role() default Role.PARENT;

    /** Email user — default sesuai role. */
    String email() default "";

    /** Nama user — default sesuai role. */
    String name() default "";

    /** ID user — default auto-generate. */
    String id() default "";

    /** Apakah user aktif — default true. */
    boolean active() default true;
}
