class View{
    constructor(){
        this.app = document.getElementById('app');
        this.title  =  this.createElement('h1','title');
        this.title.textContent = ' SEARCH WITH BALANAR';

        this.searchLine = this.createElement('div','searchline');
        this.searchInput = this.createElement('input','search-input');
        this.searchInput.setAttribute('placeholder','введите текст')
        this.searchCounter = this.createElement('span','counter');
        this.searchLine.append(this.searchInput);
        this.searchLine.append(this.searchCounter);
        
        
      

        this.repositoriesWrapper = this.createElement('div','repositories-wrapper')
        this.repositorieslist = this.createElement('ul','repositories')
        this.repositoriesWrapper.append(this.repositorieslist)

        this.main = this.createElement('div','main')
        this.main.append(this.repositoriesWrapper)

        this.loadMoreBtn = this.createElement('button','btn')
        
        this.loadMoreBtn.textContent = 'Загрузить ещё'
        this.loadMoreBtn.style.display= 'none'
        this.repositoriesWrapper.append(this.loadMoreBtn)
        

        this.app.append(this.title)
        this.app.append(this.searchLine)
        
        this.app.append(this.main)

    }
    createElement(elementTag,elementClass){
        const  element = document.createElement(elementTag)
        if(elementClass){
            element.classList.add(elementClass);
        }
        return element;
    }
    createRepositor(repositoriesData){
        const repositoriesElement = this.createElement('li','repositories-prev');
        repositoriesElement.innerHTML = `<span class='repositories-prev-login'>Name:${repositoriesData.name}</span><br> <span class='repositories-prev-login'> Stars Amount:${repositoriesData.stargazers_count}</span><br><span class='repositories-prev-login'> Login:${repositoriesData.owner.login} </span> `
        this.repositorieslist.append(repositoriesElement);

    }
    toggleLoadMoreBtn(show){
        this.loadMoreBtn.style.display = show? 'block':'none'
        }

        setcounterMessage(message){
            this.searchCounter.textContent = message
        }
    
}







class Search{
    setCurrentPage(pageNumber){
        this.currentPage = pageNumber 
    }
    setCurrentCount(count){
        this.repositoriesCount = count 
    }
    constructor(view,api,log){
        this.log = log
        this.api = api
        this.view = view
        this.view.searchInput.addEventListener('keyup',this.debounce(this.loadRepositories.bind(this),500));
        this.view.loadMoreBtn.addEventListener('click',this.loadMoreRepositories.bind(this));
        this.currentPAge = 1;
        this.repositoriesCount = 0;
        
    }
    async searcRepositories(){
      
    }

     loadRepositories(){
        this.setCurrentPage(1); 
        this.view.setcounterMessage('');
        if( this.view.searchInput.value){
            this.clearRepositories();
            this.repositoriesRequest( this.view.searchInput.value);
        }else{
        this.clearRepositories();
        this.view.toggleLoadMoreBtn(false);
    } 
    }

    loadMoreRepositories(){ 
        this.setCurrentPage(this.currentPAge + 1)
        this.repositoriesRequest();
    }

    async repositoriesRequest(searchValue){        
        let totalCount;
        let repositoriess;
        let message;
        try{
            await this.api.loadRepositories(searchValue,this.currentPage).then((res) =>{
                res.json().then(res => {
                    repositoriess = res.items;
                    totalCount = res.total_count;
                    message = this.log.counterMessage(totalCount);
                    this.setCurrentCount(this.repositoriesCount + res.items.length)
                    this.view.setcounterMessage(message);
                    this.view.toggleLoadMoreBtn(totalCount > 10 && this.repositoriesCount !== totalCount);
                    repositoriess.forEach(repositories => {this.view.createRepositor(repositories )            
                });
                }) 
            })
        }catch(e){
            console.log('Error:'+e)
            
        }
        
        

    }
    
    clearRepositories(){
        this.view.repositorieslist.innerHTML = '';
    }

    debounce(func, wait,immediate ) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const late = function(){
                timeout = null;
                if (!immediate) func.apply(context,this);
            }
            const callNow = immediate && !timeout;
            clearTimeout( timeout );
            timeout = setTimeout( func, wait );
            if(callNow) func.apply(context,args);
        }
    }
    // autocomplete(selector,data){
    //     function ciSearch(what - '',where - ''){
    //         return where.toUpperCase().search(what.toUpperCase());
    //     }
    //     searchInput.forEach(input =>{
    //         input.classList.add('autocomplete input');
    //         let wrap = document.createElement('div');
    //         wrap.className = 'autocomplete-wrap';
    //         input.parentnode.insertBefore(wrap,input);
    //         wrap.appendChild(list);

    //         let list = document.createElement('div');
    //         list.className = 'autocomplete-list';
    //         wrap.appendChild(list);
    //         input.addEventListener('input',() =>{
    //             let value = input.value;
    //             data
    //         })
    //     })

    // }
    
}
const URL = 'https://api.github.com/'
const REPOSETORIES_PER_PAGE = 10


class Api{
    async loadRepositories(value,page){
        return await fetch(`${URL}search/repositories?q=${value}&per_page=${REPOSETORIES_PER_PAGE}&page=${page}`)
    }
    
}
class Log{
    counterMessage(counter){
        return counter? `Найдено ${counter} пользователей`:`НЕ НАЙДЕНО`;

    }

}
const api = new Api();
const app = new Search(new View(),api,new Log());


function clear(what = '',where = ''){
    return where.toUpperCase().search(what.toUpperCase)
}