import { LightningElement, track, api, wire } from 'lwc';
import { FlexCardMixin } from "vlocity_cmt/flexCardMixin";
import { getNamespaceDotNotation } from "vlocity_cmt/omniscriptInternalUtils";
import { OmniscriptBaseMixin } from 'vlocity_cmt/omniscriptBaseMixin';
import { OmniscriptActionCommonUtil } from "vlocity_cmt/omniscriptActionUtils";
// import RoleName from '@salesforce/schema/User.UserRole.Name'; 
import { getRecord } from 'lightning/uiRecordApi';
import ROLE_NAME from '@salesforce/schema/User.UserRole.Name';
import USER_ID from '@salesforce/user/Id';

export default class EveryFinance extends OmniscriptBaseMixin(FlexCardMixin(LightningElement)) {

  _actionUtil;
  _ns = getNamespaceDotNotation();

  @api records;
  @track assetId;
  @track ContextId;
  @track jsoncase;
  @track caseId;
  @api ppoeUser;
  @track erroAtivoContrato = false;
  erroContrato = false;
  erroAtivo = false;

  @track userRoleName = ''; // Lista das abas que serão exibidas

  @wire(getRecord, { recordId: USER_ID, fields: [ROLE_NAME] })
  wiredUser({ error, data }) {
    if (data) {
      this.userRoleName = data.fields.UserRole.value.fields.Name.value || '';
    } else if (error) {
      console.error('Erro ao buscar UserRole:', error);
    }
  }
  get showPosicaoFinanceira() {
    return ['Administrador', 'Supervisor Indireto', 'CRV', 'Vendas', 'Loja', 'Faturamento', 'Supervisor', 'SAC', 'Suporte', 'Retenção', 'Faturamento', 'Financeiro', 'Qualidade', 'Ouvidoria', 'BackOffice CSC'].includes(this.userRoleName);
  }
  get showPendenciasFinanceiras() {
    return ['Administrador', 'Supervisor Indireto', 'CRV', 'Vendas', 'Loja', 'Supervisor', 'SAC', 'Suporte', 'Retenção', 'Faturamento', 'Financeiro', 'Qualidade', 'Ouvidoria', 'BackOffice CSC'].includes(this.userRoleName);
  }

  get showAlteracaoVencimento() {
    return ['Administrador', 'Supervisor Indireto', 'Loja', 'Supervisor', 'SAC', 'Suporte', 'Retenção', 'Faturamento', 'Financeiro', 'Qualidade', 'Ouvidoria', 'BackOffice CSC'].includes(this.userRoleName);
  }

  get showDescontos() {
    return ['Administrador', 'Supervisor Indireto', 'Supervisor', 'SAC', 'Suporte', 'Retenção', 'Faturamento', 'Financeiro', 'Qualidade', 'Ouvidoria', 'BackOffice CSC'].includes(this.userRoleName);
  }



  connectedCallback() {
    // console.log("showPosicaoFinanceira", this.showPosicaoFinanceira);
    // console.log("userRoleName", this.userRoleName);

    if (this.records.Case.AssetId == null || this.records.Case.Contrato__c == null) {
      this.erroAtivoContrato = true;
      this.erroAtivo = this.records.Case.AssetId == null ? true : false;
      this.erroContrato = this.records.Case.Contrato__c == null ? true : false;
      return;
    }
    this.jsoncase = this.records.Case;
    // console.log("records ", JSON.stringify(this.records));
    this.assetId = JSON.stringify(this.records.Case.AssetId);
    this.ContextId = this.records.Case.AssetId;
    this.ppoeUser = this.records.Case.Asset.PlanLogin__c;
    this.caseId = this.records.Case.Id;
  }
}