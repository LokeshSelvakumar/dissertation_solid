const {
    addUrl,
    addStringNoLocale,
    buildThing,
    createSolidDataset,
    createThing,
    setThing,
    saveSolidDatasetAt,
    getThing,
    getSolidDataset,
} = require("@inrupt/solid-client");
const { getSessionFromStorage } = require("@inrupt/solid-client-authn-node");
const { SCHEMA_INRUPT, RDF } = require("@inrupt/vocab-common-rdf");
const { POD_USER_IRI_REGISTRATION } = require("./constants.js");
const CONSTANTS = require("./constants.js");
// const crypto = require('crypto');

module.exports = {
    checkUserExist: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let dataseturl = CONSTANTS.POD_USER_IRI_REGISTRATION;
        if (req.type == "USER") {
            dataseturl = CONSTANTS.POD_USER_IRI_REGISTRATION;
        }
        else if (req.type == "COMPANY"){
            dataseturl = CONSTANTS.POD_COMPANY_IRI_REGISTRATION;
        }
        else {
            dataseturl = CONSTANTS.ADMIN_TTL;
        }

        const myDataset = await (this.getGivenSolidDataset(dataseturl, session));// fetch from authenticated session
        const user = getThing(myDataset, dataseturl + "#" + req.webId);

        if (user) {
            return true;
        }
        return false;
    },

    registerUser: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let usertype = CONSTANTS.PATIENT_USER;
        let rdftype = CONSTANTS.RDF_PERSON_TYPE;
        let dataseturl = CONSTANTS.POD_USER_IRI_REGISTRATION;
        console.log(req);
        // checking user as patient or company from request body
        if (req.type != "USER") {
            usertype = CONSTANTS.COMPANY_USER;
            rdftype = CONSTANTS.RDF_COMPANY_TYPE;
            dataseturl = CONSTANTS.POD_COMPANY_IRI_REGISTRATION;
        }
        let courseSolidDataset = await (this.getGivenSolidDataset(dataseturl, session));

        //building user details as thing
        const newThing = buildThing(createThing({ name: req.webId }))
            .addStringNoLocale("http://dati.beniculturali.it/cis/UserType", usertype)
            .addUrl(RDF.type, SCHEMA_INRUPT.Person)
            .build();
        courseSolidDataset = setThing(courseSolidDataset, newThing);

        //saving user details
        this.saveGivenSolidDataset(dataseturl, courseSolidDataset, session);
    },
    submitCompanyRequest: async function (req, sessionID) {

        let usertype = CONSTANTS.COMPANY_USER;
        let rdftype = CONSTANTS.RDF_COMPANY_TYPE;
        session = await getSessionFromStorage(sessionID);
        let dataseturl = CONSTANTS.COMPANY_REQUESTS;
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        // current year
        let year = date_ob.getFullYear();
        let currentDate = year + "-" + month + "-" + date;
        let purposeFullData = req.purpose.subtasks;
        let purposes = [];
        purposeFullData.forEach(function (value) {
            if (value.completed) {
                purposes.push(value.name);
            }
        });


        let courseSolidDataset = await (this.getGivenSolidDataset(dataseturl, session));
        let count = getThing(courseSolidDataset, dataseturl + "#requestCount");

        //string literal is given as output

        let requestCount;
        if (count) {
            count = count.predicates["http://purl.org/ontology/mo/record_count"]
                .literals["http://www.w3.org/2001/XMLSchema#integer"][0];
            count = parseInt(count);
            count = count + 1;
            requestCount = buildThing(createThing({ name: "requestCount" }))
                .addUrl(RDF.type, "http://www.w3.org/2003/11/swrl#Variable")
                .addInteger("http://purl.org/ontology/mo/record_count", count).build();
        }
        else {
            count = 1;
            requestCount = buildThing(createThing({ name: "requestCount" }))
                .addUrl(RDF.type, "http://www.w3.org/2003/11/swrl#Variable")
                .addInteger("http://purl.org/ontology/mo/record_count", 1).build();

        }

        if (req.requestedBy == '') {
            req.requestedBy = "https://asegroup.inrupt.net/profile/card#me"
        }

        //dummy single constraint
        let purposeConstraint = buildThing({ name: "http://example.com" + "#purposeConstraint" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/ns/odrl/2/Constraint")
            .addUrl("http://www.w3.org/ns/odrl/2/leftOperand", "https://w3id.org/oac/Purpose")
            .build();

        if (purposes.length == 1) {
            let urlPurpose;
            if (purposes[0] == "Research") {
                urlPurpose = "https://w3id.org/dpv#ResearchAndDevelopment";
            }
            else {
                urlPurpose = "https://w3id.org/dpv#ServiceUsageAnalytics";
            }
            purposeConstraint = buildThing(purposeConstraint)
                .addUrl("http://www.w3.org/ns/odrl/2/operator", "http://www.w3.org/ns/odrl/2/isA")
                .addUrl("http://www.w3.org/ns/odrl/2/rightOperand", urlPurpose)
                .build();
        }
        else if (purposes.length > 1) {
            purposeConstraint = buildThing(purposeConstraint)
                .addUrl("http://www.w3.org/ns/odrl/2/operator", "http://www.w3.org/ns/odrl/2/isAnyOf")
                .addUrl("http://www.w3.org/ns/odrl/2/rightOperand", "https://w3id.org/dpv#ResearchAndDevelopment")
                .addUrl("http://www.w3.org/ns/odrl/2/rightOperand", "https://w3id.org/dpv#ServiceUsageAnalytics")
                .build();
        }

        let d = new Date(req.selectedDate);
        
        let timeConstraintThing = buildThing({ name: "http://example.com" + "#timeConstraintThing" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/ns/odrl/2/Constraint")
            .addUrl("http://www.w3.org/ns/odrl/2/leftOperand", "http://www.w3.org/ns/odrl/2/dateTime")
            .addUrl("http://www.w3.org/ns/odrl/2/operator", "http://www.w3.org/ns/odrl/2/lteq")
            .addDate("http://www.w3.org/ns/odrl/2/rightOperand", new Date(req.selectedDate))
            .build();

        let constraintThing = buildThing({ name: "http://example.com" + "#constraint" + count })
            .addUrl("http://www.w3.org/ns/odrl/2/and", purposeConstraint)
            .addUrl("http://www.w3.org/ns/odrl/2/and", timeConstraintThing)
            .build();

        var permissionThing = buildThing({ name: "http://example.com" + "#permission" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/ns/odrl/2/Permission")
            .addUrl("http://www.w3.org/ns/odrl/2/assigner", req.requestedBy)
            .addUrl("http://www.w3.org/ns/odrl/2/target", "https://w3id.org/oac/Contact")
            .addUrl("http://www.w3.org/ns/odrl/2/action", "https://w3id.org/oac/Read")
            .addUrl("http://www.w3.org/ns/odrl/2/action", "https://w3id.org/oac/Write").build();

        if (req.isCopied) {
            permissionThing = buildThing(permissionThing)
                .addUrl("http://www.w3.org/ns/odrl/2/action", "https://w3id.org/oac/Copy")
                .build();
        }
        if (req.historyOfData) {
            permissionThing = buildThing(permissionThing)
                .addUrl("http://www.w3.org/ns/odrl/2/action", "https://w3id.org/oac/Record")
                .build();
        }
        if (req.dataSelling) {
            permissionThing = buildThing(permissionThing)
                .addUrl("http://www.w3.org/ns/odrl/2/action", "https://w3id.org/oac/sell")
                .build();
        }
        permissionThing = buildThing(permissionThing)
            .addUrl("http://www.w3.org/ns/odrl/2/constraint", constraintThing)
            .build();
        
        let commentThing = buildThing({ name: "http://example.com" + "#commentThing" + count })
        .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type","http://schema.org/comment")
        .build();

        let dataAccessRequestThing = buildThing({ name: "http://example.com" + "#policy" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/ns/odrl/2/Policy")
            .addUrl("http://www.w3.org/ns/odrl/2/profile", "https://w3id.org/oac/")
            .addUrl("http://www.w3.org/ns/odrl/2/Permission", permissionThing)
            .addStringNoLocale("http://purl.org/dc/terms/created", currentDate)
            .addInteger("http://schema.org/upvoteCount",0)
            .addInteger("http://schema.org/downvoteCount",0)
            .addUrl("http://schema.org/comment",commentThing)
            .build();

        let currentCompRequestThing = getThing(courseSolidDataset, dataseturl + "#" + "http://example.com/companyrequests");
        let newRequest;
        if (currentCompRequestThing) {
            newRequest = buildThing(currentCompRequestThing)
                .addUrl("http://example.com/requests", dataAccessRequestThing)
                .build();
        }
        else {
            newRequest = buildThing(createThing({ name: "http://example.com/companyrequests" }))
                .addUrl("http://example.com/requests", dataAccessRequestThing)
                .build();
        }
        courseSolidDataset = setThing(courseSolidDataset, requestCount);
        courseSolidDataset = setThing(courseSolidDataset, newRequest);
        courseSolidDataset = setThing(courseSolidDataset, dataAccessRequestThing);
        courseSolidDataset = setThing(courseSolidDataset, permissionThing);
        courseSolidDataset = setThing(courseSolidDataset, constraintThing);
        courseSolidDataset = setThing(courseSolidDataset, purposeConstraint);
        courseSolidDataset = setThing(courseSolidDataset, timeConstraintThing);
        courseSolidDataset = setThing(courseSolidDataset,commentThing);
        this.saveGivenSolidDataset(CONSTANTS.COMPANY_REQUESTS,
            courseSolidDataset, session)
    },

    // METHOD TO FETCH THE DATASET
    getGivenSolidDataset: async function (dataseturl, session) {
        return await getSolidDataset(dataseturl, { fetch: session.fetch });
    },

    saveGivenSolidDataset: async function (dataseturl, courseSolidDataset, session) {
        const savedSolidDataset = await saveSolidDatasetAt(
            dataseturl,
            courseSolidDataset,      // fetch from authenticated Session
            { fetch: session.fetch }
        );
    },

    getAllCompanyRequests:async function (sessionId){
        session = await getSessionFromStorage(sessionId);
        return await this.getGivenSolidDataset(CONSTANTS.COMPANY_REQUESTS, session);
    }
}

