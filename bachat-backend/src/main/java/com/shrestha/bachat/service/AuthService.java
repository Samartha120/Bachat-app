package com.shrestha.bachat.service;

import com.shrestha.bachat.config.JwtService;
import com.shrestha.bachat.dto.AuthRequest;
import com.shrestha.bachat.dto.AuthResponse;
import com.shrestha.bachat.model.User;
import com.shrestha.bachat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    @Value("${app.company.name}")
    private String companyName;

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + request.getUsername()));

        String token = jwtService.generateToken(user);

        auditLogService.recordAction(
                user.getUsername(),
                "USER_LOGIN",
                "User#" + user.getId(),
                "User logged in successfully with role " + user.getRole()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .companyName(companyName)
                .build();
    }

    public AuthResponse getCurrentUserResponse(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .companyName(companyName)
                .build();
    }
}
