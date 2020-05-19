CREATE TABLE IF NOT EXISTS scoreUser (username TEXT, url TEXT, password TEXT);
CREATE TABLE IF NOT EXISTS dataStore(indicatorUrl TEXT, dataValues TEXT);
CREATE TABLE IF NOT EXISTS analyticsData(url TEXT, dateCreated DATE, orgUnitID TEXT, orgUnitData TEXT, periodData TEXT, monthExecuted TEXT, yearExecuted TEXT);
CREATE TABLE IF NOT EXISTS organisationUnit(url TEXT, orgUnitData, TEXT);
