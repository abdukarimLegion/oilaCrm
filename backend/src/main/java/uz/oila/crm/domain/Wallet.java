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
 * Ҳамён (нақд, карта, банк ёки жамғарма счета).
 */
@Getter
@Setter
@Entity
@Table(name = "wallet")
@NoArgsConstructor
public class Wallet {

    @Id
    @Column(name = "id", length = 63)
    private String id;

    @Column(name = "name_cyrl", nullable = false)
    private String nameCyrl;

    @Column(name = "name_latn", nullable = false)
    private String nameLatn;

    @Column(name = "type", nullable = false, length = 16)
    private String type; // cash | card | bank | savings

    @Column(name = "balance", nullable = false)
    private Long balance;

    @Column(name = "currency", nullable = false, length = 8)
    private String currency;

    @Column(name = "color", nullable = false, length = 32)
    private String color;

    @JsonProperty("name_cyrl")
    public String getNameCyrl() {
        return nameCyrl;
    }

    @JsonProperty("name_latn")
    public String getNameLatn() {
        return nameLatn;
    }
}
