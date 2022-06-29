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
        let dataseturl = POD_USER_IRI_REGISTRATION;
        if (req.type != "USER") {
            dataseturl = POD_COMPANY_IRI_REGISTRATION;
        }

        const myDataset = await getSolidDataset(
            dataseturl,
            { fetch: session.fetch }          // fetch from authenticated session
        );

        const user = getThing(
            myDataset,
            dataseturl+"#"+req.weId
        );
        console.log(myDataset);
        console.log("the user retrieved");
        console.log(user);
    }
    ,
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
            dataseturl = POD_COMPANY_IRI_REGISTRATION;
        }
        let courseSolidDataset = await getSolidDataset(
            dataseturl,
            { fetch: session.fetch }          // fetch from authenticated session
        );
        //building user details as thing
        const newBookThing1 = buildThing(createThing({ name: req.webId }))
            .addStringNoLocale(SCHEMA_INRUPT.name, usertype)
            .addUrl(RDF.type, rdftype)
            .build();
        courseSolidDataset = setThing(courseSolidDataset, newBookThing1);

        //saving user details
        const savedSolidDataset = await saveSolidDatasetAt(
            dataseturl,
            courseSolidDataset,      // fetch from authenticated Session
            { fetch: session.fetch }
        );

    }

}

