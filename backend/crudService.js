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

module.exports = {
    checkUserExist: async function (req, sessionID) {
        session = await getSessionFromStorage(sessionID);
        let dataseturl = CONSTANTS.POD_USER_IRI_REGISTRATION;
        if (req.type != "USER") {
            dataseturl = CONSTANTS.POD_COMPANY_IRI_REGISTRATION;
        }

        const myDataset = getGivenSolidDataset(dataseturl, session);// fetch from authenticated session
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
        let courseSolidDataset = getGivenSolidDataset(dataseturl, session);

        //building user details as thing
        const newThing = buildThing(createThing({ name: req.webId }))
            .addStringNoLocale("http://dati.beniculturali.it/cis/UserType", usertype)
            .addUrl(RDF.type, SCHEMA_INRUPT.Person)
            .build();
        courseSolidDataset = setThing(courseSolidDataset, newThing);

        //saving user details
        saveGivenSolidDataset(dataseturl, courseSolidDataset, session);
    },
    submitCompanyRequest: async function (req, sessionID) {
        // https://solid-pcrv.inrupt.net/private/Requests/companyRequests.ttl
        let usertype = CONSTANTS.COMPANY_USER;
        let rdftype = CONSTANTS.RDF_COMPANY_TYPE;
        session = await getSessionFromStorage(sessionID);
        let dataseturl = CONSTANTS.COMPANY_REQUESTS;
        const myDataset = getGivenSolidDataset(dataseturl, session);
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        // current year
        let year = date_ob.getFullYear();
        let currentDate = year + "-" + month + "-" + date;
        let purposeFullData = req.purpose.subtasks;
        let purposes = [];
        purposeOfData.forEach(function (value){
            if(value.completed){
                purposes.add(value.name);
            }
        });
        const Request = buildThing({ name: "DataRequestProperties" })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "https://w3id.org/GDPRtEXT#HealthData")
            .addUrl("http://purl.org/dc/terms/valid",req.selectedDate)
            .addUrl("http://vocab.deri.ie/cogs#Copy",req.isCopied)
            .addUrl("http://www.identity.org/ontologies/identity.owl#History",req.historyOfData)
            .addUrl("http://www.ontotext.com/proton/protonext#Sale",req.dataSelling)
            .addUrl("https://w3id.org/GConsent#Purpose",purposes)
            .build();
            
        const dataAccessRequestThing = buildThing({ name: "CompanyRequest" })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://vocab.data.gov/def/drm#DataAccess")
            .addUrl("http://vocab.datex.org/terms#requestedBy", req.requestedBy)
            .addUrl("http://purl.org/dc/terms/created", currentDate)
            .addUrl("http://purl.org/linked-data/api/vocab#properties",Request)
            .build();

        const newThing = buildThing(createThing({ name: req.webId }))
            .addStringNoLocale("http://dati.beniculturali.it/cis/UserType", usertype)
            .addUrl("https://w3id.org/GDPRtEXT#ContractWithDataSubject", dataAccessRequestThing)
            .build();
        courseSolidDataset = setThing(courseSolidDataset, newThing);
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
    }
}

