package uz.oila.crm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Қарз ҳамкорлари (contacts).
 */
@Getter
@Setter
@Entity
@Table(name = "contact")
@NoArgsConstructor
public class Contact {

    @Id
    @Column(name = "id", length = 63)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "telegram", length = 127)
    private String telegram;

    @Column(name = "whatsapp", length = 127)
    private String whatsapp;

    @Column(name = "notes")
    private String notes;

    @Column(name = "avatar_color", nullable = false, length = 32)
    private String avatarColor;
}
