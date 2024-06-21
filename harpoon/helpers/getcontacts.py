def get_contacts(filename):

    names = []
    emails = []

    # append names to names and emails to emails, from each row of mycontacts.txt using .split method
    # pos0 being name and pos1 being email -- return both lists
    with open('assets/mycontacts.txt', mode='r', encoding='utf-8') as contacts_file:
        for a_contact in contacts_file:
            names.append(a_contact.split()[0])
            emails.append(a_contact.split()[1])
    return names, emails
