# case_status.py
import requests
from bs4 import BeautifulSoup


def get_case_status(case_type, case_num, year):
    # This block tries to get html content, otherwise returns with empty
    # dictionary.
    try:
        web_page = get_html_page(
            "http://courtnic.nic.in/supremecourt/casestatus_new/querycheck_new.asp", {
                "seltype": case_type, "txtnumber": case_num, "selcyear": year})
    except:
        print("ERROR! There was some problem in retrieving page.")
        return {}

    # This block tries to parse the retrieved html content, otherwise returns
    # with empty dictionary.
    try:
        result = {}
        parsed_doc = BeautifulSoup(web_page, "html.parser")
        # getting list of all tables, as all data resides in tables.
        table_elem_list = parsed_doc.find_all('table')
    except:
        return {}

    # calling helper functions to extract all required data.
    set_is_disposed(table_elem_list, result)
    set_petitioner_and_respondent(table_elem_list, result)
    set_pet_advocate_and_res_advocate(table_elem_list, result)
    set_case_converted(parsed_doc, table_elem_list, result)
    return result


# Helper functions

# Gets Html Content of argumented url.
# Throws exception, if HTTP response status is not 200 (OK).
def get_html_page(url, params):
    req = requests.post(url, data=params)
    req.raise_for_status()
    return req.text

# Extracts and sets "is_disposed" field.
# If extracted data string is equal to "DISPOSED", then sets field to
# True, otherwise False.


def set_is_disposed(table_elem_list, result):
    result["is_disposed"] = False
    try:
        if (table_elem_list[5].tr.find_all('td')[
                2].font.strong.string == "DISPOSED"):
            result["is_disposed"] = True
    except:
        return

# Extracts and sets petitioner and respondent details.
# If exceptions occur during extraction of data, then sets data to an
# empty string.


def set_petitioner_and_respondent(table_elem_list, result):
    try:
        tr_elem_list = table_elem_list[8].find_all('tr')
    except:
        print("ERROR! Enable to retrieve petitioner and respondent.")
        result["petitioner"] = result["respondent"] = ""
    else:
        try:
            result["petitioner"] = tr_elem_list[1].td.font.string.strip()
        except:
            result["petitioner"] = ""

        try:
            result["respondent"] = tr_elem_list[3].td.font.string.strip()
        except:
            result["respondent"] = ""

# Extracts and sets advocate details,
# If exceptions occur during extraction of data, then sets data to an
# empty string.


def set_pet_advocate_and_res_advocate(table_elem_list, result):
    try:
        tr_elem_list = table_elem_list[11].find_all("tr")
    except:
        print("ERROR! Enable to retrieve advocates detail.")
        result["pet_advocate"] = result["res_advocate"] = ""
    else:
        try:
            result["pet_advocate"] = tr_elem_list[
                1].find_all('td')[1].font.string.strip()
        except:
            result["pet_advocate"] = ""
        try:
            result["res_advocate"] = tr_elem_list[
                2].find_all('td')[1].font.string.strip()
        except:
            result["res_advocate"] = ""

# Checks for converted_case, by checking existence of hidden input with "id"="nan",
# If it is present, then extracts converted case data,
# Otherwise, return empty dictionary


def set_case_converted(parsed_doc, table_elem_list, result):
    try:
        case_type = int(parsed_doc.find(id="nan")['value'])
        if (isinstance(case_type, int) == False):
            raise Exception()

        td_elem_list = table_elem_list[3].find_all("tr")[3].find_all("td")
        values = td_elem_list[2].b.font.string.split("/")
        result["case_converted"] = {
            "case_type": case_type, "case_num": int(
                values[0]), "year": int(
                values[1])}
    except:
        result["case_converted"] = {}

#print (get_case_status (3, 13, 2015))
