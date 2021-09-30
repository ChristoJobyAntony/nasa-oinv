import json
from os import name


# To parse bureau codes to json format

def bureauCode() :
    import csv
    dat = {}
    with open('./data/rawData/rawBureauCode.csv') as f :
        reader = csv.reader(f)
        reader.__next__()
        for rec in reader :
            code = f"{rec[2]}:{rec[3]}:{rec[4]}:{rec[5]}"
            bureauCode = int(rec[3])
            agencyCode = int(rec[2])
            bureau = rec[1]
            agency = rec[0]

            dat[f"{agencyCode}:{bureauCode}"] = {
                'bureau' : bureau,
                'agency' : agency,
                'code' : code,
                'agencyCode' : f"{agencyCode:03d}",
                'bureauCode' : f"{agencyCode:03d}:{bureauCode:02d}"
            }

        # print(dat)

    with open('./data/bureauCode/bureauCode.json', 'w') as f : 
        json.dump(dat, f)

    with open('./data/bureauCode/prettyBureauCode.json', 'w') as f : 
        json.dump(dat, f, indent=1)

# To parse Program Codes
def programCode():
    import csv
    dat = {}
    with open('./data/rawData/rawProgramCode.csv', encoding='utf8') as f :
        reader = csv.reader(f)
        reader.__next__()
        for rec in reader :
            programCode = rec[5]
            agencyCode = rec[3]
            program = rec[1]
            agency = rec[0]
            
            dat[programCode] = {
                'program' : program,
                'agency' : agency,
                'agencyCode' : agencyCode
            }

        # print(dat)

    with open('./data/programCode/programCode.json', 'w') as f : 
        json.dump(dat, f)

    with open('./data/programCode/prettyProgramCode.json', 'w') as f : 
        json.dump(dat, f, indent=1)

# Read Program code and bureau codes raw data to identify available agencies
def agency():
    import csv
    dat = {}
    with open('./data/rawData/rawProgramCode.csv', encoding='utf8') as f :
        reader = csv.reader(f)
        reader.__next__()
        for rec in reader :
            agency = rec[0]
            code = int(rec[3])
            code = f"{code:03d}"

            dat[code] = agency

    with open('./data/rawData/rawBureauCode.csv', encoding='utf8') as f :
        reader = csv.reader(f)
        reader.__next__()
        for rec in reader :
            agency = rec[0]
            code = int(rec[2])
            code = f"{code:03d}"
          
            dat[code] = agency

    with open('./data/agency/agency.json', 'w') as f : 
        json.dump(dat, f)

    with open('./data/agency/prettyAgency.json', 'w') as f : 
        json.dump(dat, f, indent=1)

# Read the raw data to extract publisher info and cocatenate organizational hierarchy with ','
def publisher () :
    with open('./data/rawData/data.json', encoding="utf8") as file :
        dataSets = json.load(file)
        dat = set()
        for rec in dataSets['dataset'] : 
            publisher = ''
            org = rec['publisher']
            while 'subOrganizationOf' in org : 
                publisher = org['name'] + ', ' + publisher
                org = org['subOrganizationOf']
            publisher += org['name']
            dat.add(publisher)
        
        dat = list(dat)

    with open('./data/publisher/publisher.json', 'w') as f : 
        json.dump(dat, f)

    with open('./data/publisher/prettyPublisher.json', 'w') as f : 
        json.dump(dat, f, indent=1)

# Collect all possible keywords
def keyword() :
    with open('./data/rawData/data.json', encoding="utf8") as file :
        dataSets = json.load(file)
        dat = set()
        for rec in dataSets['dataset'] :
            publisher = ''
            keywords = rec.get('keyword', [])
            dat.update(keywords)
        
        dat = list(dat)

    with open('./data/keyword/keyword.json', 'w') as f : 
        json.dump(dat, f)

    with open('./data/keyword/prettyKeyword.json', 'w') as f : 
        json.dump(dat, f, indent=1)

#Collect all contact names
def contactPoint() :
    dat = {}
    with open('./data/rawData/data.json', encoding="utf8") as file :
            dataSets = json.load(file)
            for rec in dataSets['dataset'] :
                contact = rec['contactPoint']['fn']
                if contact == 'undefined' :continue
                dat[contact] = {'email' : rec['contactPoint']['hasEmail']}

    with open('./data/contactPoint/contactPoint.json', 'w') as f : 
        json.dump(dat, f)

    with open('./data/contactPoint/prettyContactPoint.json', 'w') as f : 
        json.dump(dat, f, indent=1)

# Collect all the themes
def themes () :
    with open('./data/rawData/data.json', encoding="utf8") as file :
            dataSets = json.load(file)
            dat = set()
            for rec in dataSets['dataset'] :
                publisher = ''
                theme = rec.get('theme', [])
                dat.update(theme)
    # Clean up the data        
    dat = list(map(lambda x : x.replace('\"', ''), dat))

    with open('./data/theme/theme.json', 'w') as f : 
        json.dump(dat, f)

    with open('./data/theme/prettyTheme.json', 'w') as f : 
        json.dump(dat, f, indent=1)

bureauCode()
programCode()
agency()
publisher()
keyword()
contactPoint()
themes()
