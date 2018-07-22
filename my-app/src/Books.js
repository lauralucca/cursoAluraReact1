import React, { Component } from 'react';
import $ from 'jquery';
import CustomInput from './components/CustomInput';
import CustomButton from './components/CustomButton';
import PubSub from 'pubsub-js';
import ErrorHandler from './ErrorHandler';

class BooksForm extends Component {
    constructor() {
        super();
        this.state = { titulo: '', preco: '', autorId: '' };
        this.booksFormSubmit = this.booksFormSubmit.bind(this);
        this.setTitle = this.setTitle.bind(this);
        this.setPrice = this.setPrice.bind(this);
        this.setAuthorId = this.setAuthorId.bind(this);
    }

    setTitle(event) {
        this.setState({ titulo: event.target.value });
    }

    setPrice(event) {
        this.setState({ preco: event.target.value });
    }

    setAuthorId(event) {
        this.setState({ autorId: event.target.value });
    }

    booksFormSubmit(event) {
        event.preventDefault();
        let data = {titulo: this.state.titulo.trim(), preco: this.state.preco.trim(), autorId: this.state.autorId};
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            // url: 'https://cdc-react.herokuapp.com/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify(data),
            success: function(newList) {
                PubSub.publish('atualiza-lista-livros', newList);
                this.setState({titulo: '', preco: '', autorId: ''});
            }.bind(this),
            error: function(res) {
                if(res.status === 400) {
                    new ErrorHandler().publicaErros(res.responseJSON);
                };
            },
            beforeSend: function() {
                PubSub.publish("limpa-erros", {});
            }
        });
    }

    render() {
        return (
            <form className="pure-form pure-form-aligned" onSubmit={this.booksFormSubmit}>
                <select value={ this.state.authorsId } name="authorsId" onChange={ this.setAuthorId }>
                    <option value="">Selecione</option>
                    { 
                        this.props.authors.map(function(authors) {
                        return <option key={ authors.id } value={ authors.id }>
                                    { authors.nome }
                                </option>;
                        })
                    }
                </select>
                <CustomInput id="title" type="text" name="title" label="Título" value={this.state.titulo} onChange={this.setTitle} />
                <CustomInput id="price" type="text" name="price" label="Preço" value={this.state.preco} onChange={this.setPrice} />
                <CustomButton label="" type="submit" text="Gravar" />
            </form>
        )
    }

}

class BooksTable extends Component {
    render() {
        return (
            <table className="pure-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Autor</th>
                        <th>Preço</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.list.map(function (book) {
                            return (
                                <tr key={book.id}>
                                    <td>{book.titulo}</td>
                                    <td>{book.autor.nome}</td>
                                    <td>{book.preco}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        )
    }
}

export default class BooksBox extends Component {
    constructor() {
        super();
        this.state = { list: [], authors: [] };
    }

    componentWillMount() {
        $.ajax({
            url: 'http://localhost:8080/api/autores',
            // url:'https://cdc-react.herokuapp.com/api/autores',
            dataType: 'json',
            success: function(res) {
                this.setState({ authors: res })
            }.bind(this)
        });
    }

    componentDidMount() {
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            // url: 'https://cdc-react.herokuapp.com/api/livros',
            dataType: 'json',
            success: function(res) {
                this.setState({ list: res });
            }.bind(this)
        });

        PubSub.subscribe('atualiza-lista-livros', function(topico, newList) {
            this.setState({ list: newList });
        }.bind(this));
    }

    render () {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Livros</h1>
                </div>
                <div className="content" id="content">
                    <BooksForm authors={this.state.authors} />              
                    <BooksTable list={this.state.list} authors={this.state.authors} />
                </div>  
            </div>
        );
    }
}