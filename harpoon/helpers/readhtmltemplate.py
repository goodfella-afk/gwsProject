from string import Template

def read_html_template(filename):

    #return template obj
    with open('assets/html.txt', 'r', encoding='utf-8') as template_file:
        template_file_content = template_file.read()
    return Template(template_file_content)
