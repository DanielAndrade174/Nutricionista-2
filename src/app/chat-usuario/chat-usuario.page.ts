import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Mensagem } from '../model/mensagem';

@Component({
  selector: 'app-usuario-nutri',
  templateUrl: './chat-usuario.page.html',
  styleUrls: ['./chat-usuario.page.scss'],
})
export class ChatUsuarioPage implements OnInit {

  idNutricionista : string;
  idUsuario : string;
  firestore = firebase.firestore();
  settings = {timestampsInSnapshots: true};

  conversa : Mensagem[] = [];

  formGroup : FormGroup;
  @ViewChild('txtarea') txtarea;
  

  constructor(public activatedRoute: ActivatedRoute,
    public router: Router,
    public nav: NavController,
    public firebaseauth : AngularFireAuth,
    private formBuilder : FormBuilder, ) {
      
      this.idUsuario = this.activatedRoute.snapshot.paramMap.get('usuario');
      
      this.firebaseauth.authState.subscribe(obj=>{
        this.idNutricionista = this.firebaseauth.auth.currentUser.uid;

       console.log(this.idNutricionista)
  
      });

    }

  ngOnInit() {

    let ref = this.firestore.collection('nutricionista').doc(this.idNutricionista).collection("mensagem");
        ref.onSnapshot(doc=> {

          doc.docChanges().forEach(c =>{
            
              if(c.doc.data().para==this.idNutricionista || c.doc.data().de==this.idNutricionista){
                let m = new Mensagem();
              
                m.setDados(c.doc.data());
                this.conversa.push(m);
              }
          })

        });


  }



  atualiza(){
    let ref = this.firestore.doc('mensagem/'+this.idNutricionista).collection(this.idUsuario);
    ref.get().then(doc =>{
      doc.forEach(c=>{
        
       let m = new Mensagem();
        m.setDados(c.data());
        this.conversa.push(m);
        
      })
      
    })


  }


 
  enviarMensagem(){

    this.formGroup = this.formBuilder.group({
      data : [ new Date()],
      mensagem : [this.txtarea.value],
      de : [this.idNutricionista],
      para : [this.idUsuario],

   });


   let ref = this.firestore.collection('usuario').doc(this.idUsuario).collection("mensagem").add(this.formGroup.value)
   .then(resp=>{
      console.log('Cadastrado com sucesso');
      this.enviarNutricionista();
    }).catch(function(){
      console.log('Erro ao cadastrar');
    })

  }

  enviarNutricionista(){

    let ref = this.firestore.collection('nutricionista').doc(this.idNutricionista).collection("mensagem").add(this.formGroup.value)
    .then(resp=>{
       console.log('Cadastrado com sucesso');
     }).catch(function(){
       console.log('Erro ao cadastrar');
     })
  }

  Home() {
    this.router.navigate(['/lista-de-usuarios']);
  }

}
