from parse import agency, bureauCode, publisher
from neo4j import GraphDatabase
import json

uri = "neo4j://192.168.0.140:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "tony2003"))

def addAgency() :

    def addAgency(tx, name, code):
        tx.run("CREATE (a:Agency {name : $name, code: $code} )",
            name=name,
            code=code
        )

    with driver.session() as session,  open('./data/agency/agency.json') as f :
        dat = json.load(f)
        for code, rec in dat.items() :
            session.write_transaction(addAgency, rec, code)

def addBureau() : 

    def addBureau(tx, bureauCode, name):
        tx.run("CREATE (b:Bureau {name : $name, code : $bureauCode} )",
            name=name,
            bureauCode=bureauCode,
            )
    def bureauOf(tx, bureauCode, agencyCode) :
        tx.run("MATCH (a:Agency), (b:Bureau) WHERE a.code = $agencyCode AND b.code = $bureauCode CREATE (a) <-[r: BUREAU_OF]- (b)",
                agencyCode=agencyCode,
                bureauCode=bureauCode)

    with driver.session() as session,  open('./data/bureauCode/bureauCode.json') as f :
        dat = json.load(f)
        for rec in dat.values() :
            session.write_transaction(addBureau, rec['bureauCode'], rec['bureau'])
            session.write_transaction(bureauOf, rec['bureauCode'], rec['agencyCode'])

def addProgram():

    def addProgram(tx, pID, name):
        tx.run("CREATE (b:Program {name : $name, code : $pid} )",
            name=name,
            pid=pID)
    def programBy(tx, programCode, agencyCode) :
        tx.run("MATCH (a:Agency), (b:Program) WHERE a.code = $agencyCode AND b.code = $programCode CREATE (a) <-[r: PROGRAM_OF]- (b)",
                agencyCode=agencyCode,
                programCode=programCode)

    with driver.session() as session,  open('./data/programCode/programCode.json') as f :
        dat = json.load(f)
        for programCode, rec in dat.items() :
            session.write_transaction(addProgram, programCode, rec['program'])
            session.write_transaction(programBy, programCode, rec['agencyCode'])

def addPublisher() :
    def addPublisher(tx, name):
        tx.run("CREATE (p:Publisher {name : $name} )",
            name=name,
            )
    with driver.session() as session,  open('./data/publisher/publisher.json') as f :
        dat = json.load(f)
        for  rec in dat :
            session.write_transaction(addPublisher, rec)

def addContactPoint() :
    def addContactPoint(tx, name, email):
        tx.run("CREATE (c:ContactPoint {name: $name, email: $email} )",
            name=name,
            email=email
            )
    with driver.session() as session,  open('./data/contactPoint/contactPoint.json') as f :
        dat = json.load(f)
        for  key, rec in dat.items() :
            session.write_transaction(addContactPoint, key, rec['email'])

def addTheme() :
    def addTheme(tx, name):
        tx.run("CREATE (c:Theme {name : $name} )",
            name=name,
            )
    with driver.session() as session,  open('./data/theme/theme.json') as f :
        dat = json.load(f)
        for  rec in dat :
            session.write_transaction(addTheme, rec)

def addKeyword () :
    def addKeyword(tx, name):
        tx.run("CREATE (p:Keyword {name : $name} )",
            name=name,
            )
    with driver.session() as session,  open('./data/keyword/keyword.json') as f :
        dat = json.load(f)
        for  rec in dat :
            session.write_transaction(addKeyword, rec)

def addDataset () :

    dataTemplate = ['title', 'identifier', 'landingPage', 'accrualPeriodicity', 'description',  'dataQuality', 'license', 'issued', 'distribution']
    print("CREATE (d:Dataset {" + ", ".join([' '+key+': $'+key for key in dataTemplate]) + " })",)
    
    def addDataset(tx, data):
        return tx.run(
        "CREATE (d:Dataset {" + ", ".join([' '+key+': $'+key for key in dataTemplate]) + " }) RETURN id(d)",
        **data).single()['id(d)']
    
    def addRealtedBureau (tx, identifier, code) :
        tx.run(
        "MATCH (d:Dataset), (b:Bureau) WHERE id(d) = $identifier AND b.code = $code CREATE (d)-[: RELATED_BUREAU]->(b)",
        identifier = identifier,
        code = code
        )
    
    def addRelatedPrograms (tx, identifier, programCode) :
        tx.run(
            'MATCH (d:Dataset), (pro:Program) WHERE id(d) = $identifier AND pro.code = $programCode CREATE (d)-[: RELATED_PROGRAM]->(pro)',
            programCode = programCode,
            identifier = identifier
        )

    def addPublishedBy (tx, identifier, name) :
        tx.run(
        "MATCH (d:Dataset), (p:Publisher) WHERE id(d) = $identifier AND p.name = $name CREATE (d)-[: PUBLISHED_BY]->(p)",
        identifier = identifier,
        name = name
        ) 

    def addRealtedKeywords (tx, identifier, word) :
        tx.run(
        "MATCH (d:Dataset), (k:Keyword) WHERE id(d) = $identifier AND k.name = $word CREATE (d)-[: RELATED_KEYWORD]->(k)",
        identifier = identifier,
        word = word
        ) 
    
    def addRelatedTheme (tx, identifier, theme) :
        tx.run(
        "MATCH (d:Dataset), (t:Theme) WHERE id(d) = $identifier AND t.name = $theme CREATE (d)-[: RELATED_THEME]->(t)",
        identifier = identifier,
        theme = theme
        ) 

    def addContactInfo (tx, identifier, name) :
        tx.run(
        "MATCH (d:Dataset), (c:ContactPoint) WHERE id(d) = $identifier AND c.name = $name CREATE (d)-[: CONTACT_TO]->(c)",
        identifier = identifier,
        name = name
        ) 
    

    with driver.session() as session,  open('./data.json', encoding='utf8') as f :
        dataSets = json.load(f) 
        l = len(dataSets['dataset'])
        c = 0
        for data in dataSets['dataset'] :
            rec = {}
            for key  in dataTemplate : 
                if data.get(key):
                    if type(data.get(key)) == str :
                        rec[key] = data.get(key)
                    else :
                        rec[key] = json.dumps(data.get(key))
                else : 
                    rec[key] =None
            
            identifier = session.write_transaction(addDataset, rec)


            # identifier = (data['identifier'], data['title'], data['issued'])

            for bureauCode in data.get('bureauCode', []) :
                session.write_transaction(addRealtedBureau, identifier, bureauCode)
            
            for programCode in data.get('programCode', []) :
                session.write_transaction(addRelatedPrograms, identifier, programCode)
            
            if data.get("publisher") :
                publisher = ''
                org = data['publisher']
                while 'subOrganizationOf' in org : 
                    publisher = org['name'] + ', ' + publisher
                    org = org['subOrganizationOf']
                publisher += org['name']
                session.write_transaction(addPublishedBy, identifier, publisher)
            
            for keyword in data.get("keyword", []) :
                session.write_transaction(addRealtedKeywords, identifier, keyword)
            
            for theme in data.get("theme", []) :
                session.write_transaction(addRelatedTheme, identifier, theme)
            
            if data.get('contactPoint') :
                contact = data['contactPoint']
                session.write_transaction(addContactInfo, identifier, contact['fn'])
            
            # c += 1
            # print(f'Completed {c}/{l}')



addAgency()
addBureau()
addProgram()
addPublisher()
addContactPoint()
addTheme()
addKeyword()
addDataset()



driver.close()
