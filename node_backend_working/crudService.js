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
        if (req.type != "USER") {
            dataseturl = CONSTANTS.POD_COMPANY_IRI_REGISTRATION;
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

        const Request = buildThing({ name: "DataRequestProperties_" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "https://w3id.org/GDPRtEXT#HealthData")
            .addStringNoLocale("http://purl.org/dc/terms/valid", new Date(req.selectedDate).toDateString())
            .addStringNoLocale("http://vocab.deri.ie/cogs#Copy", req.isCopied)
            .addStringNoLocale("http://www.identity.org/ontologies/identity.owl#History", req.historyOfData)
            .addStringNoLocale("http://www.ontotext.com/proton/protonext#Sale", req.dataSelling)
            .addStringNoLocale("https://w3id.org/GConsent#Purpose", purposes)
            .build();

        const dataAccessRequestThing = buildThing({ name: "Data_access_Request_" + count })
            .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://vocab.data.gov/def/drm#DataAccess")
            .addStringNoLocale("http://vocab.datex.org/terms#requestedBy", req.requestedBy)
            .addStringNoLocale("http://purl.org/dc/terms/created", currentDate)
            .addUrl("http://purl.org/linked-data/api/vocab#properties", Request)
            .build();

        let newRequest;
        let currentCompRequestThing = getThing(courseSolidDataset, dataseturl  + req.requestedBy);
        if (currentCompRequestThing) {
            newRequest = buildThing(currentCompRequestThing)
            .addUrl("http://example.request#" + count, dataAccessRequestThing)
            .build();
        }
        else {
            newRequest = buildThing(createThing({ name: req.requestedBy }))
                .addStringNoLocale("http://dati.beniculturali.it/cis/UserType", usertype)
                .addUrl("http://example.request#" + count, dataAccessRequestThing)
                .build();
        }
        courseSolidDataset = setThing(courseSolidDataset, newRequest);
        courseSolidDataset = setThing(courseSolidDataset, dataAccessRequestThing);
        courseSolidDataset = setThing(courseSolidDataset, Request);
        courseSolidDataset = setThing(courseSolidDataset, requestCount);
        this.saveGivenSolidDataset("https://solid-pcrv.inrupt.net/private/Requests/companyRequests.ttl",
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
    }
}

