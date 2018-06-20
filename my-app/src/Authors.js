import React, { Component } from 'react';
import $ from 'jquery';
import CustomInput from './components/CustomInput';
import CustomButton from './components/CustomButton';
import PubSub from 'pubsub-js';
import ErrorHandler from './ErrorHandler';

class AuthorsForm extends Component {
    constructor() {
        super();
        this.state = { nome: '', email: '', senha: '' };
        this.enviaForm = this.enviaForm.bind(this);
        this.setNome = this.setNome.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setSenha = this.setSenha.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        $.ajax({
            url: "http://localhost:8080/api/autores",
            // url:"https://cdc-react.herokuapp.com/api/autores",
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({ nome: this.state.nome, email: this.state.email, senha: this.state.senha }),
            success: function(novaLista){
                PubSub.publish('atualiza-lista-autores', novaLista);
                this.setState({nome:'',email:'',senha:''});
            }.bind(this),
            error: function(resposta){
                if(resposta.status === 400) {
                    new ErrorHandler().publicaErros(resposta.responseJSON);
                };
            } ,
            beforeSend: function(){
                PubSub.publish("limpa-erros", {});
            }             
        });
    }

    setNome(evento) {
        this.setState({ nome: evento.target.value });
    }

    setEmail(evento) {
        this.setState({ email: evento.target.value });
    }

    setSenha(evento) {
        this.setState({ senha: evento.target.value });
    }

    render() {
        return (
            <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm.bind(this)} method="post">

                <CustomInput id="nome" type="text" name="nome" label="Nome" value={this.state.nome} onChange={this.setNome} />
                <CustomInput id="email" type="email" name="email" label="E-mail" value={this.state.email} onChange={this.setEmail} />
                <CustomInput id="senha" type="password" name="senha" label="Senha" value={this.state.senha} onChange={this.setSenha} />

                <CustomButton label="" type="submit" text="Gravar" />

            </form>
        )
    }
}

class AuthorsTable extends Component {
    render() {
        return (
            <table className="pure-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>email</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.lista.map(function (autor) {
                            return (
                                <tr key={autor.id}>
                                    <td>{autor.nome}</td>
                                    <td>{autor.email}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        )
    }
}

export default class AuthorsBox extends Component {
    constructor() {
        super();
        this.state = { lista: [] };
    }

    componentDidMount() {
        $.ajax({
            url: "http://localhost:8080/api/autores",
            // url:"https://cdc-react.herokuapp.com/api/autores",
            dataType: 'json',
            success: function (resposta) {
                this.setState({ lista: resposta });
            }.bind(this)
        });

        PubSub.subscribe('atualiza-lista-autores', function(topico, novaLista) {
            this.setState({ lista: novaLista });
        }.bind(this));
    }

    render () {
        return (
            <div>
                <AuthorsForm/>              
                <AuthorsTable lista={this.state.lista}/> 
            </div>                        
        );
    }

}
