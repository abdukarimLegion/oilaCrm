package uz.oila.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import uz.oila.crm.domain.Contact;
import uz.oila.crm.repo.ContactRepository;
import uz.oila.crm.service.LocalDto.LocalContact;

import java.util.List;

/**
 * Алоқалар (contacts) CRUD.
 */
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contacts;

    @Transactional(readOnly = true)
    public List<Contact> findAll() {
        return contacts.findAll();
    }

    @Transactional
    public Contact create(LocalContact body) {
        Contact c = new Contact();
        c.setId(Ids.newId("c_"));
        apply(c, body);
        return contacts.save(c);
    }

    @Transactional
    public Contact update(String id, LocalContact body) {
        Contact c = contacts.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Алоқа топилмади: " + id));
        apply(c, body);
        return contacts.save(c);
    }

    @Transactional
    public void delete(String id) {
        contacts.deleteById(id);
    }

    private void apply(Contact c, LocalContact body) {
        if (body.name() != null) c.setName(body.name());
        if (body.phone() != null) c.setPhone(body.phone());
        if (body.telegram() != null) c.setTelegram(body.telegram());
        if (body.whatsapp() != null) c.setWhatsapp(body.whatsapp());
        if (body.notes() != null) c.setNotes(body.notes());
        if (body.avatarColor() != null) c.setAvatarColor(body.avatarColor());
    }
}
