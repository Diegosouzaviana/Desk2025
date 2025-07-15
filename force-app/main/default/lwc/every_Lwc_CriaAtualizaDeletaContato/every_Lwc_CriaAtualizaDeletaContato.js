import { LightningElement, track, api } from 'lwc';
import { OmniscriptBaseMixin } from "vlocity_cmt/omniscriptBaseMixin";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getNamespaceDotNotation } from 'vlocity_cmt/omniscriptInternalUtils';
import { OmniscriptActionCommonUtil } from 'vlocity_cmt/omniscriptActionUtils';

export default class Every_Lwc_CriaAtualizaDeletaContato extends OmniscriptBaseMixin(LightningElement) {
    _actionUtilClass;
    _ns = getNamespaceDotNotation();
    _obj;
    @track phones = []; // Array para armazenar os telefones recebidos
    @track emails = []; // Variável para armazenar o e-mail recebido
    @track isPhoneLimitReached = false;
    @track contIndex = [];
    @track emailIndex = [];
    @track phoneIndexToDelete = ''; // Índice do telefone a ser deletado
    @track showModal = false; // Controla a exibição do modal
    @track showModal1 = false; // Controla a exibição do modal
    @track showModal2 = false; // Controla a exibição do modal
    @track showModal3 = false; // Controla a exibição do modal
    @track customerid;
    @track cpf;
    @track contactId;
    @track caseId;
    @track campoClasse = '';
    @track mostrarMensagem = false;
    @track mensagemClasse = '';
    QuantIndex = true;
    emailQuantIndex = true;
    beforeUpdateIndexes = [];
    Type;
    customerid;
    TipoFone;
    newPhoneNumber = '';
    oldPhoneNumber = '';
    mensagemPersonalizada = '';
    novoEmail;
    emailAtual;
    emailAntigo = '';
    errorMessage = 'Formato de e-mail inválido';
    items;
    isNew = false;
    newClass = '';
    isValidEmail;
    isNewOfClickedIndex;
    msg = '';
    emailvisivel = false;
    emailestilo = '';
    currentPhone;
    currentEmail;
    oldPhone;
    oldEmail;
    copiaOBJ;
    errormsg;
    avisoTelefoneNovoSeraSalvo = false;
    // Inicialize um objeto para armazenar os telefones antigos
    oldPhoneNumbers = {};
    oldEmailNumbers = {};
    @track originalValues = {};
    @track emailErrors = {
        old_email1: '',
        old_email2: '',
        old_email3: '',
        old_email4: ''
    };
    @track emailvalidado = {
        old_email1: '',
        old_email2: '',
        old_email3: '',
        old_email4: ''
    };
    desabilitasbutton = true;
    hasChangesemail = true;
    @api
    get obj() {
        return this._obj;
    }
    set obj(value) {
        this._obj = value;
    }
    extrairCampos(obj) {
        return {
            omniPhones: [obj.old_telefone1, obj.old_telefone2, obj.old_telefone3, obj.old_telefone4, obj.old_telefone5],
            EmailContato: [obj.old_email1, obj.old_email2, obj.old_email3, obj.old_email4, obj.old_email5],
            customerid: obj.customerid,
            cpf: obj.cpf,
            contactId: obj.contactId,
            caseId: obj.caseId
        };
    };
    connectedCallback() {
        console.log('obj -> ' + JSON.stringify(this.obj));
        let omniData = this.extrairCampos(this.obj);
        console.log(JSON.stringify(omniData));
        this._actionUtilClass = new OmniscriptActionCommonUtil();
        this.phones = omniData.omniPhones.filter(phone => phone !== '');
        this.emails = omniData.EmailContato.filter(email => email !== '');
        this.customerid = omniData.customerid;
        this.caseId = omniData.caseId;
        this.copiaOBJ = { ...this.obj };

        const emailInput1 = this.template.querySelector('lightning-input[data-fieldname="old_email1"]');
        if (emailInput1) {
            emailInput1.addEventListener('change', event => this.handleEmailChange(event, 'old_email1'));
        }

        this.contIndex = this.phones.map((phone, index) => ({
            index: index + 1,
            phone: !phone ? '' : phone,
            isNew: this.isNew, // Defina isNew como false para todos os telefones existentes inicialmente
            newClass: this.newClass,
            mostrarMensagem: this.mostrarMensagem,
            mensagemClasse: this.mensagemClasse,
            mensagemPersonalizada: this.mensagemPersonalizada
        }));
        if (this.contIndex.length < 5) {
            this.QuantIndex = true;
        } else {
            this.QuantIndex = false;
        }
    }
    handlePhoneChange(event) {
        const phoneIndex = event.target.dataset.index;
        const newPhone = event.target.value;

        this.contIndex[phoneIndex - 1].phone = newPhone;

        this.oldPhone = this.phones[phoneIndex - 1];
        this.currentPhone = this.phones[phoneIndex - 1];

        const oldPhone = this.phones[phoneIndex - 1];
        this.oldPhoneNumbers[phoneIndex] = {
            oldPhone: oldPhone,
            newPhone: newPhone
        };

        const telefones = this.oldPhoneNumbers[phoneIndex];
        const currentPhone = this.contIndex[phoneIndex - 1];
        if (telefones.oldPhone === undefined && telefones.newPhone !== "") {
            currentPhone.mensagemPersonalizada = "Clique em salvar para concluir o processo.";
            currentPhone.mostrarMensagem = true;
            currentPhone.mensagemClasse = "mensagem-alterada";
        } else if (telefones.oldPhone === undefined && telefones.newPhone === "") {
            currentPhone.mensagemPersonalizada = "";
            currentPhone.mostrarMensagem = false;
            currentPhone.mensagemClasse = "";
        } else if (telefones.oldPhone !== "" && telefones.newPhone !== telefones.oldPhone) {
            currentPhone.mensagemPersonalizada = "Clique em salvar para concluir o processo.";
            currentPhone.mostrarMensagem = true;
            currentPhone.mensagemClasse = "mensagem-alterada";
        } else {
            currentPhone.mensagemPersonalizada = "";
            currentPhone.mostrarMensagem = false;
            currentPhone.mensagemClasse = "";
        }
    }
    handleEmailChange(event) {
        const FIELD_NAMES = ["old_email1", "old_email2", "old_email3", "old_email4"];
        const emailInput = event.target;
        const fieldValue = emailInput.value;
        const fieldName = emailInput.dataset.fieldname;

        // Limpa mensagens de erro atuais
        FIELD_NAMES.forEach(name => this.clearError(name));
        const isValid = this.validateEmail(fieldValue);
        //salvo o valor true ou false da validação do email
        this.emailvalidado[fieldName] = isValid;
        //consulta se existe algum email no formato invalido
        const valoresConsultados = this.consultarValores();
        // Verifica se há e-mails repetidos no copiaOBJ
        const saoDiferentes = this.validarEmailsRepetidos(fieldValue);
        // Verifica se email e diferente do email de origem
        const checkForEmail = this.checkForEmailChanges(fieldName, fieldValue);
        // Atualiza os email novo valor apenas se for válido
        if (fieldValue == "" || fieldValue == null) {
            console.log("entrou1");
            this.updateEmailInfo(fieldName, fieldValue, "", "", false);
        }
        else if (isValid && checkForEmail && !valoresConsultados) {
            console.log("entrou2");
            if (!saoDiferentes) {
                console.log("entrou3");
                this.updateEmailInfo(fieldName, fieldValue, "Clique em atualizar email para concluir o processo.", "mensagem-alterada", false);
            } else {
                console.log("entrou5");
                this.updateEmailInfo(fieldName, fieldValue, "Já existe um e-mail do mesmo tipo.", "mensagem-alterada", true);
            }
        } else if (!isValid && checkForEmail) {
            console.log("entrou6");
            this.updateEmailInfo(fieldName, fieldValue, "Por favor, insira um endereço de e-mail válido.", "mensagem-alterada", true);
        } else {
            console.log("entrou7");
            this.clearError(fieldName);
            this.copiaOBJ = { ...this.copiaOBJ, [fieldName]: fieldValue };
            this.desabilitasbutton = true;
        }
    }

    updateEmailInfo(fieldName, fieldValue, errorMessage, errorType, disableButton) {
        this.desabilitasbutton = disableButton;
        this.emailErrors[fieldName] = errorMessage;
        this.errormsg = errorType;
        this.copiaOBJ = { ...this.copiaOBJ, [fieldName]: fieldValue };
    }

    validarEmailsRepetidos(fieldValue) {
        const chaves = Object.keys(this.copiaOBJ)
        for (let i = 0; i < chaves.length; i++) {
            const chave = chaves[i];
            const valor = this.copiaOBJ[chave];
            if (valor == fieldValue) {
                return true;
            }
        }
        return false;
    }

    consultarValores() {
        const chaves = Object.keys(this.emailvalidado);
        for (let i = 0; i < chaves.length; i++) {
            const chave = chaves[i];
            const valor = this.emailvalidado[chave];
            if (valor == "false") {
                return true;
            }
        }
        return false;
    }

    checkForEmailChanges(fieldName, fieldValue) {

        const hasChanged = this.obj[fieldName] !== fieldValue;
        return hasChanged;
    }
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    clearError(fieldName) {
        this.emailErrors[fieldName] = '';
    }

    getChangedEmailFields() {
        const changedEmailFields = [];
        const obj = this.obj;
        const copiaobj = this.copiaOBJ;

        for (const field in obj) {
            if (field.startsWith("old_email") && obj[field] !== copiaobj[field]) {
                changedEmailFields.push(field);
            }
        }
        return changedEmailFields;
    }

    updateEmailErrors(changedEmailFields) {

        changedEmailFields.forEach(fieldName => {
            const oldValue = this.obj[fieldName];
            const newValue = this.copiaOBJ[fieldName];

            if (newValue !== "") {
                console.log("fieldName", fieldName);
                this.emailErrors[fieldName] = "O e-mail foi atualizado com sucesso.";
                this.errormsg = "mensagem-sucesso";
            } else {
                console.log("fieldName2", fieldName);
                this.emailErrors[fieldName] = "O e-mail excluido com sucesso.";
                this.errormsg = "mensagem-alterada";
            }
        });
    }

    formatPhone(phoneNumber) {
        console.log("formatPhone ", +1);
        const cleaned = ('' + phoneNumber).replace(/\D/g, ''); // Remove caracteres não numéricos
        if (phoneNumber == null || phoneNumber == '') {
            return null;
        } else if (cleaned.length === 11) {
            // Formato para celular: (99) 9xxxx-xxxx
            return '(' + cleaned.substring(0, 2) + ')' + cleaned.substring(2, 7) + '-' + cleaned.substring(7);
        } else {
            // Formato para telefone fixo: (99) xxxx-xxxx
            return '(' + cleaned.substring(0, 2) + ')' + cleaned.substring(2, 6) + '-' + cleaned.substring(6);
        }
    }
    addPhone() {
        this.cleanErrors();

        if (this.contIndex.length < 5) {
            this.contIndex.push({ index: this.contIndex.length + 1, phone: '', isNew: true, newClass: '', mostrarMensagem: false });
            if (this.contIndex.length == 5) {
                this.QuantIndex = false;
            }
        } else if (this.contIndex.length <= 1) {
            this.contIndex.forEach(ci => {
                ci.deleteClass = 'hide';
            })
        }
    }

    cleanErrors() {
        this.contIndex.forEach(e => {
            e.mostrarMensagem = false;
            e.mensagemPersonalizada = '';
            e.mensagemClasse = '';
        });
    }

    updateIndexes() {
        // Atualiza os índices após a exclusão de um elemento
        this.contIndex.forEach((item, index) => {
            item.index = index + 1;
        });
        this.QuantIndex = true;
    }

    confirmDelete(event) {

        console.log("confirmDelete ");
        const index = event.currentTarget.dataset.index;
        const phone = event.currentTarget.dataset.phone;
        console.log("beforeUpdateIndexes", this.beforeUpdateIndexes);
        console.log("index ", index);
        console.log("phone ", phone);
        let isNew = false;
        let hasSavedPhonesFilled = false;

        // não permitir excluir o telefone preenchido caso os outros telefones estejam vazios
        let anyPhoneFilled = false; // armazena se algum dos telefones (exceto o index atual) está preenchido
        this.contIndex.forEach(e => {
            console.log('e -> ' + JSON.stringify(e));

            if (e.phone && e.phone != '' && e.phone.length >= 10 && e.index != index) {
                anyPhoneFilled = true;
            }

            if (e.phone && e.phone.length >= 10 && index != e.index) {
                if (!e.isNew) {
                    hasSavedPhonesFilled = true;
                    console.log('phone not is new');
                } else {
                    console.log('phone is new');
                }
            }

        });

        if (!hasSavedPhonesFilled && anyPhoneFilled) {
            this.contIndex[0].mostrarMensagem = true;
            this.contIndex[0].mensagemPersonalizada = 'Salve os números de telefone pendentes antes de excluir';
            this.contIndex[0].mensagemClasse = 'mensagem-alterada';
            return;
        }

        // se não houver telefones preenchidos, não permitirá excluir o telefone principal
        if (!anyPhoneFilled) {
            this.contIndex[0].mostrarMensagem = true;
            this.contIndex[0].mensagemPersonalizada = 'Obrigatório ao menos 1 número de telefone preenchido';
            this.contIndex[0].mensagemClasse = 'mensagem-alterada';
            return;
        }

        // se os únicos telefones preenchidos ainda não foram salvos, salvará automaticamente para impedir que o usuário se esqueça
        if (!hasSavedPhonesFilled) {
            this.avisoTelefoneNovoSeraSalvo = true;
            console.log("os outros telefones não foram salvos, então vamos salvá-los");
            const index = 1;
            const phone = this.contIndex[1].phone;

            this.newPhoneNumber = phone;
            this.phoneIndexToDelete = index;
        }

        // Não deixar excluir o telefone único
        if (this.contIndex.length <= 1) {
            this.contIndex[0].mostrarMensagem = true;
            this.contIndex[0].mensagemPersonalizada = 'Obrigatório ao menos 1 número de telefone';
            this.contIndex[0].mensagemClasse = 'mensagem-alterada';
            return;
        }

        this.isNew = this.contIndex[index - 1].isNew;
        this.phoneIndexToDelete = index;
        this.oldPhoneNumber = phone;
        this.showModal = true;
    }
    confirmaAtualiza(event) {
        console.log("confirmaAtualiza ");
        const index = event.currentTarget.dataset.index - 1;
        const Novophone = event.currentTarget.dataset.phone;
        console.log('novophone ' + Novophone);
        const formattedPhone = Novophone ? this.formatPhone(Novophone) : '';
        console.log("formattedPhone " + formattedPhone);

        const oldformattedPhone = this.oldPhone ? this.formatPhone(this.oldPhone) : '';
        console.log("Telefone antigo:", oldformattedPhone);

        if (formattedPhone.length < 10) {
            this.contIndex[index].mostrarMensagem = true;
            this.contIndex[index].mensagemPersonalizada = 'O telefone deve ter pelo menos 10 dígitos.';
            this.contIndex[index].mensagemClasse = 'mensagem-alterada';
            return;
        }

        if (formattedPhone.length === 14) {
            this.TipoFone = "celular";
        } else {
            this.TipoFone = "fone";
        }

        this.phoneIndexToDelete = index;
        this.newPhoneNumber = formattedPhone;
        this.oldPhoneNumber = oldformattedPhone;
        this.showModal1 = true;
    }
    confimarnovoPhone(event) {
        console.log("confimarnovoPhone ");
        const index = event.currentTarget.dataset.index;
        const phone = event.currentTarget.dataset.phone;
        console.log("phone " + phone);

        this.newPhoneNumber = phone;
        this.phoneIndexToDelete = index;
        this.showModal2 = true;
    }
    confirmaAlteraEmail(event) {
        this.showModal3 = true;
    }

    async updatePhone() {
        console.log("updatePhone ");
        let Type = "Altera";
        const phoneIndex = this.phoneIndexToDelete;
        let oldPhoneNumber = this.oldPhoneNumber;
        let newPhoneNumber = this.newPhoneNumber;
        const currentPhone = this.contIndex[phoneIndex - 1];

        if (newPhoneNumber != oldPhoneNumber && oldPhoneNumber != null) {
            console.log("Os números de telefone são diferentes!");
            await this.CallIntegrationGeral(this.caseId, Type, phoneIndex, oldPhoneNumber, newPhoneNumber, null)
                .then((data) => {
                    console.log("data " + JSON.stringify(data));
                    if (data?.result?.IPResult?.statuscode == 200) {
                        this.showModal1 = false;
                        this.mostrarToast(data.result.IPResult.message, 'success');
                        currentPhone.mensagemPersonalizada = "Telefone inserido com sucesso.";
                        currentPhone.mostrarMensagem = true;
                        currentPhone.mensagemClasse = "mensagem-sucesso";
                    } else if (data?.result?.IPResult?.result?.statuscode == 400) {
                        this.showModal1 = false;
                        this.mostrarToast(data.result.IPResult.result.message, 'Error');
                    } else if (data?.result?.IPResult?.result?.statuscode == 404) {
                        this.showModal1 = false;
                        this.mostrarToast(data.result.IPResult.result.message, 'Error');
                    } else if (data?.result?.IPResult?.result?.statuscode == 409) {
                        this.showModal1 = false;
                        this.mostrarToast(data.result.IPResult.result.message, 'Error');
                    } else {
                        console.log("statuscode " + data.result.IPResult.result.statuscode);
                        this.showModal1 = false;
                        this.mostrarToast('O telefone não teve alteração', 'Error');
                    }
                }).catch((error) => {
                    console.error(error);
                });
        } else {
            this.showModal1 = false;
            this.mostrarToast('Esse número de telefone já existe.', 'Error');
            console.log("Os números de telefone são iguais.");
        }

    }
    async deleteConfirmed() {
        console.log('delete confirmed');

        this.deleteConfirmedAction();
    }

    async deleteConfirmedAction() {
        let Type = "deleta";
        const phoneIndex = this.phoneIndexToDelete;
        let oldPhoneNumber = this.oldPhoneNumber;
        let isNewOf = this.isNew;
        console.log('is new? ' + this.isNew);


        if (oldPhoneNumber == null) {
            this.contIndex.splice(phoneIndex - 1, 1);
            this.showModal = false;
            this.updateIndexes();
        } else if (oldPhoneNumber != null && isNewOf == true) {
            this.contIndex.splice(phoneIndex - 1, 1);
            this.showModal = false;
            this.updateIndexes();
        } else {
            console.log('Phone to delete -> ' + oldPhoneNumber);
            await this.CallIntegrationGeral(this.caseId, Type, phoneIndex, oldPhoneNumber, null, null)
                .then((data) => {
                    console.log("data " + JSON.stringify(data));
                    if (data?.result?.IPResult?.statuscode == 200) {
                        this.mostrarToast(data.result.IPResult.message, 'success');
                        this.contIndex.splice(phoneIndex - 1, 1);
                        this.showModal = false;
                        this.updateIndexes();
                        const phoneIndexToDelete = phoneIndex;

                    } else if (data?.result?.IPResult?.result?.statuscode == 400) {
                        console.log("statuscode " + data?.result?.IPResult?.result?.statuscode);
                        this.showModal = false;
                        this.mostrarToast(data.result.IPResult.result.message, 'Error');
                    } else if (data?.result?.IPResult?.result?.statuscode == 404) {
                        this.showModal = false;
                        console.log("statuscode " + data?.result?.IPResult?.result?.statuscode);
                        this.mostrarToast(data.result.IPResult.result.message, 'Error');
                    } else if (data?.result?.IPResult?.result?.statuscode == 500) {
                        console.log("statuscode " + data?.result?.IPResult?.result?.statuscode);
                        this.showModal = false;
                        this.mostrarToast(data.result.IPResult.result.message, 'Error');
                    } else {
                        console.log("statuscode " + data?.result?.IPResult?.result?.statuscode);
                        this.showModal = false;
                        this.mostrarToast('O telefone não houve alteração.', 'Error');
                    }


                }).catch((error) => {
                    console.error(error);
                });
        }
    }

    async novoPhone() {
        console.log("novoPhone ");
        let Type = "Adiciona";
        let newPhoneNumber = this.newPhoneNumber;
        let nuberIndex = this.phoneIndexToDelete;
        const currentPhone = this.contIndex[nuberIndex - 1];

        if (newPhoneNumber == null) {
            this.showModal2 = false;
            this.mostrarToast('Não foi possivel adicionar o novo contato, pois o telefone esta vazio.', 'Error');
        } else {
            console.log("entra 1");
            await this.CallIntegrationGeral(this.caseId, Type, nuberIndex, null, newPhoneNumber, null)
                .then((data) => {
                    console.log("data " + JSON.stringify(data));
                    if (data?.result?.IPResult?.statuscode == 200) {
                        this.showModal2 = false;
                        this.mostrarToast(data.result.IPResult.message, 'success');
                        currentPhone.mensagemPersonalizada = "Telefone adicionado com sucesso.";
                        currentPhone.mostrarMensagem = true; // Exibe a mensagem
                        currentPhone.mensagemClasse = "mensagem-sucesso";
                        currentPhone.isNew = false;
                        this.phones.push(newPhoneNumber);
                    } else if (data?.result?.IPResult?.result?.statuscode == 400) {
                        console.log("statuscode " + data.result.IPResult.result.statuscode);
                        this.showModal2 = false;
                        this.mostrarToast(data.result.IPResult.result.message, 'Error');
                    } else if (data?.result?.IPResult?.result?.statuscode == 404) {
                        console.log("statuscode " + data.result.IPResult.result.statuscode);
                        this.showModal2 = false;
                        this.mostrarToast(data.result.IPResult.result.message, 'Error');
                    } else if (data?.result?.IPResult?.result?.statuscode == 500) {
                        console.log("statuscode " + data.result.IPResult.result.statuscode);
                        this.showModal2 = false;
                        this.mostrarToast(data.result.IPResult.result.message, 'Error');
                    } else {
                        console.log("statuscode " + data.result.IPResult.result.statuscode);
                        this.showModal2 = false;
                        this.mostrarToast(data.result.IPResult.result.message, 'Error');
                    }
                }).catch((error) => {
                    // Trate erros aqui, se necessário
                    console.error(error);
                });
        }

    }
    async alteraEmail() {
        console.log('alteraEmail');
        const Type = "AlteraEmail";
        this.hasChangesemail = false;

        const Formatado = {
            "old_email1": this.copiaOBJ["old_email1"],
            "old_email2": this.copiaOBJ["old_email2"],
            "old_email3": this.copiaOBJ["old_email3"],
            "old_email4": this.copiaOBJ["old_email4"]
        };

        const valoresFiltrados = Object.values(Formatado).filter(val => val !== "");
        // console.log("valoresFiltrados ", valoresFiltrados);
        const stringFormatada = valoresFiltrados.join(', ');
        // console.log("stringFormatada ", stringFormatada);
        const objFormatado = {
            "old_email1": this.copiaOBJ["old_email1"],
            "old_email2": this.copiaOBJ["old_email2"],
            "old_email3": this.copiaOBJ["old_email3"],
            "old_email4": this.copiaOBJ["old_email4"],
            "stringFormatada": stringFormatada
        };
        // console.log("objFormatado ", JSON.stringify(objFormatado));

        await this.CallIntegrationGeral(this.caseId, Type, null, null, null, objFormatado)
            .then((data) => {
                console.log("data " + JSON.stringify(data));
                if (data?.result?.IPResult?.statuscode == 200) {
                    this.showModal3 = false;
                    this.desabilitasbutton = true;
                    this.mostrarToast(data.result.IPResult.message.message, 'success');
                    const changedEmailFields = this.getChangedEmailFields();
                    console.log("changedEmailFields", JSON.stringify(changedEmailFields));
                    this.updateEmailErrors(changedEmailFields);
                    this.obj = { ...this.copiaOBJ };
                } else if (data?.result?.IPResult?.result?.statuscode == 400 ||
                    data?.result?.IPResult?.result?.statuscode == 404 ||
                    data?.result?.IPResult?.result?.statuscode == 409) {
                    console.log("statuscode " + data.result.IPResult.result.statuscode);
                    this.showModal3 = false;
                    this.mostrarToast(data.result.IPResult.result.message, 'Error');
                } else {
                    this.showModal3 = false;
                    this.mostrarToast('O e-mail não houve alteração.', 'Error');
                }
            }).catch((error) => {
                // Trate erros aqui, se necessário
                console.error(error);
            });

    }

    closeModal() {
        console.log("closeModal ");
        this.showModal = false;
        this.showModal1 = false;
        this.showModal2 = false;
        this.showModal3 = false;
    }
    CallIntegrationGeral(caseId, type, phoneIndexToDelete, oldPhoneNumber, newPhoneNumber, objFormatado) {
        return new Promise((resolve, reject) => {
            console.log("CallIntegrationGeral ");

            let input;
            if (type == "AlteraEmail") {
                input = {
                    Type: "AlteraEmail",
                    caseId: caseId,
                    objFormatado: objFormatado
                };
                console.log("input ", input);
            } else if (type == "deleta") {
                input = {
                    Type: "deleta",
                    oldPhoneNumber: oldPhoneNumber,
                    numberIndex: phoneIndexToDelete,
                    caseId: this.caseId
                };
            }
            else if (type == "Altera") {
                input = {
                    Type: "Altera",
                    newPhoneNumber: newPhoneNumber,
                    oldPhoneNumber: oldPhoneNumber,
                    numberIndex: phoneIndexToDelete,
                    TipoFone: this.TipoFone,
                    caseId: this.caseId
                };
            } else if (type == "Adiciona") {
                input = {
                    Type: "Adiciona",
                    newPhoneNumber: newPhoneNumber,
                    caseId: this.caseId,
                    numberIndex: phoneIndexToDelete
                };
            } else {
                window.console.log("Erro parâmetros invalidos.");
            }

            const params = {
                input: JSON.stringify(input),
                sClassName: "IntegrationProcedureService",
                sMethodName: "Every_CriaAtualizaDeletaContato",
                options: "{}",
            };
            this._actionUtilClass
                .executeAction(params, null, this, null, null)
                .then((response) => {
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                });
        });
    }
    mostrarToast(message, variant) {
        const evt = new ShowToastEvent({
            title: variant === 'success' ? 'Sucesso' : 'Erro',
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}