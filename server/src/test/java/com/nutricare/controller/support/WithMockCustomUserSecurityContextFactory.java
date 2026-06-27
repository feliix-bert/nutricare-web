package com.nutricare.controller.support;

import com.nutricare.TestDataFactory;
import com.nutricare.domain.entity.User;
import com.nutricare.domain.enums.Role;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

/**
 * Membuat {@link SecurityContext} berisi {@link User} entity sungguhan
 * (bukan {@code String} principal seperti {@code @WithMockUser}).
 * <p>
 * Ini penting karena method controller menerima
 * {@code @AuthenticationPrincipal User user} — perlu object {@code User}
 * yang {@code instanceof UserDetails}.
 */
public class WithMockCustomUserSecurityContextFactory
        implements WithSecurityContextFactory<WithMockCustomUser> {

    @Override
    public SecurityContext createSecurityContext(WithMockCustomUser annotation) {
        Role role = annotation.role();
        String email = annotation.email().isEmpty()
            ? role.name().toLowerCase() + "@test.com"
            : annotation.email();
        String name = annotation.name().isEmpty()
            ? switch (role) {
                case PARENT   -> "Orang Tua";
                case MEDIC    -> "Tenaga Kesehatan";
                case POSYANDU -> "Kader Posyandu";
                case ADMIN    -> "Administrator";
            }
            : annotation.name();

        User user = TestDataFactory.createUser(role, email, name);
        if (!annotation.id().isEmpty()) {
            user.setId(annotation.id());
        }
        user.setIsActive(annotation.active());

        Authentication auth = new UsernamePasswordAuthenticationToken(
            user, null, user.getAuthorities());

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        return context;
    }
}
