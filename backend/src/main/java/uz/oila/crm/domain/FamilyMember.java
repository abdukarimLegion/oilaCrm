package uz.oila.crm.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Оила аъзоси.
 */
@Getter
@Setter
@Entity
@Table(name = "family_member")
@NoArgsConstructor
public class FamilyMember {

    @Id
    @Column(name = "id", length = 63)
    private String id;

    @Column(name = "name_cyrl", nullable = false)
    private String nameCyrl;

    @Column(name = "name_latn", nullable = false)
    private String nameLatn;

    @Column(name = "role_cyrl", nullable = false)
    private String roleCyrl;

    @Column(name = "role_latn", nullable = false)
    private String roleLatn;

    @Column(name = "avatar_color", nullable = false, length = 32)
    private String avatarColor;

    @JsonProperty("name_cyrl")
    public String getNameCyrl() {
        return nameCyrl;
    }

    @JsonProperty("name_latn")
    public String getNameLatn() {
        return nameLatn;
    }

    @JsonProperty("role_cyrl")
    public String getRoleCyrl() {
        return roleCyrl;
    }

    @JsonProperty("role_latn")
    public String getRoleLatn() {
        return roleLatn;
    }
}
