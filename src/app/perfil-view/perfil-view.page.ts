import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Nutricionista } from '../model/nutricionista';
import * as firebase from 'firebase';
import { FormBuilder } from '@angular/forms';
import { ToastController, LoadingController, NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil-view',
  templateUrl: './perfil-view.page.html',
  styleUrls: ['./perfil-view.page.scss'],
})
export class PerfilViewPage implements OnInit {

  id: string;
  usuarioEmail: string;
  Nutricionista: Nutricionista = new Nutricionista();
  firestore = firebase.firestore();
  settings = { timestampsInSnapshots: true };
  formGroup: FormGroup;
  imagem: any;

  constructor(public formBuilder: FormBuilder,
    public toastController: ToastController,
    public firebaseauth: AngularFireAuth,
    public loadingController: LoadingController,
    public router: Router) {

    this.form();
    this.firebaseauth.authState.subscribe(obj => {
      this.id = this.firebaseauth.auth.currentUser.uid;
      this.usuarioEmail = this.firebaseauth.auth.currentUser.email;

      let ref = this.firestore.collection('nutricionista').doc(this.id)
      ref.get().then(doc => {
        console.log(doc.data())

        this.Nutricionista.setDados(doc.data());

        this.formGroup.controls['nome'].setValue(this.Nutricionista.nome);
        this.formGroup.controls['sobrenome'].setValue(this.Nutricionista.sobrenome);
        this.formGroup.controls['telefone'].setValue(this.Nutricionista.telefone);
        this.formGroup.controls['cel'].setValue(this.Nutricionista.cel);
        this.formGroup.controls['cidade'].setValue(this.Nutricionista.cidade);
      });

    });
  }

  form() {
    this.formGroup = this.formBuilder.group({
      nome: [],
      sobrenome: [],
      telefone: [],
      cel: [],
      cidade: [],

    });
  }

  ngOnInit() {
    this.downloadFoto();
  }

  atualizarperfil() {
    console.log(this.formGroup.value)
    console.log(this.id)

    let ref = this.firestore.collection('nutricionista')
    ref.doc(this.id).set(this.formGroup.value)
      .then(() => {
        this.toast('Atualizado com Sucesso');
        this.router.navigate(['/perfil-n']);
      }).catch(() => {
        this.toast('Erro ao Atualizar')
      }) 
  }


  async toast(msg: string) {
    const toast = await this.toastController.create({
      message: 'Cadastrado com sucesso!',
      duration: 2000
    });
    toast.present();
  }

  async loading() {
    const loading = await this.loadingController.create({
      message: 'Carregando',
      duration: 2000
    });
    await loading.present();
  }

  cancelar() {
    this.router.navigate(['/perfil-n']);
  }

  enviaArquivo(event) {
    let imagem = event.srcElement.files[0];
    let ref = firebase.storage().ref()
      .child(`nutricionista/${this.id}.jpg`);

    ref.put(imagem).then(url => {
      this.downloadFoto();
    })
  }

  downloadFoto() {
    let ref = firebase.storage().ref()
      .child(`nutricionista/${this.id}.jpg`);

    ref.getDownloadURL().then(url => {
      this.imagem = url;
    })
  }
}