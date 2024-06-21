from string import Template

def read_plain_template(filename):

    #return template obj
    with open('assets/plain.txt', 'r', encoding='utf-8') as template_file:
        template_file_content = template_file.read()
    return Template(template_file_content)
