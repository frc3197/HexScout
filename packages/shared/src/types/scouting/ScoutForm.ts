export class ScoutForm {
  uuid: string;

  submittingScouterUuid: string;

  eventCode: string;
  matchNumber: number;
  teamNumber: number;

  formVersion: string;

  createdAt: Date;
  uploadedAt: Date;

  syncAttempts: number;

  data: ScoutData;

  history: ScoutFormHistoryEntry[];

  constructor(
    uuid: string,
    submittingScouterUuid: string,
    eventCode: string,
    matchNumber: number,
    teamNumber: number,
    formVersion: string,
    data: ScoutData
  ) {
    this.uuid = uuid;
    this.submittingScouterUuid = submittingScouterUuid;
    this.eventCode = eventCode;
    this.matchNumber = matchNumber;
    this.teamNumber = teamNumber;
    this.formVersion = formVersion;
    this.createdAt = new Date();
    this.uploadedAt = new Date();
    this.syncAttempts = 0;
    this.data = data;
    this.history = [];
  }
}

export class ScoutFormHistoryEntry {
  revision: number;
  data: ScoutData;
  modifiedAt: Date;
  modifiedBy: string;

  constructor(
    revision: number,
    data: ScoutData,
    modifiedBy: string
  ) {
    this.revision = revision;
    this.data = data;
    this.modifiedAt = new Date();
    this.modifiedBy = modifiedBy;
  }
}

export interface ScoutData {
  formType: "match" | "pit";
  //TODO: implement rest of form
}

export class MatchData implements ScoutData {
  formType: "match" | "pit";
  constructor() {
    this.formType = "match";
  }
}

export class PitData implements ScoutData {
  formType: "match" | "pit";
  imageId: number;
  //TODO: implement rest of form
  constructor(
    imageId: number
  ) {
    this.formType = "pit";
      this.imageId = imageId;
  }
}