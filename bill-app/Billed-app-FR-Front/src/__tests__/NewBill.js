/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import {handleChangeFile, handleSubmit, updateBill} from "../containers/NewBill.js"
import router from "../app/Router.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills"

describe("Given I am connected as an employee", () => {
  //Je suis connecté en tant qu'employé
  describe("When I am on NewBill Page", () => {
    //Je suis devant le formulaire pour créé une nouvelle note de frais
    test("Then new bill icon in vertical layout should be highlighted", async () => {
      //L’icône associé à l’affichage du formulaire de nouvelle note de frais dans la barre verticale est mis en surbrillance.
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })  // simule les donnée du localstorage
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
        // simule la connexion en tant qu'employé
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill) //  simule la navigation vers l'affichage du formulaire newbill
      await waitFor(() => screen.getByTestId('icon-mail'))
      const MailIcon = screen.getByTestId('icon-mail') // récupère l'icone
      expect(MailIcon.classList.contains("active-icon")).toBeTruthy() // verifie si l'icone est en surbrillance
    })
    describe("When I add not supporting file", () => {
      //J’ajoute un fichier dont le format n’est pas supporté (not png/jpg/jpeg)
      test("Then I can't submit the form and I get an error message", async () => {
        //Il est impossible d’envoyer le formulaire et un message d’erreur s’affiche.
      const extensionAccepted = ['png', 'jpg',  'jpeg'] // tableau des extension accepté
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })  // simule les donnée du localstorage
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
        // simule la connexion en tant qu'employé
      }))
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      } // simule navigation vers la page du formulaire
      
      const newBil = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const conditionNotFormat = new File(["0 "], "test.txt", {type: "text/txt"}) // créé un fichier txt


      const inputFile = screen.getByTestId("file")
      const handleChangeFiles = jest.fn((e) => newBil.handleChangeFile(e)) // simule la methode handleChangeFile
      inputFile.addEventListener("change", handleChangeFiles) // ajoute un event change
      fireEvent.change(inputFile, {target: {files: [conditionNotFormat]}}) //ajoute le fichier au mauvais format dans l'input 
      const alert = await screen.getByText("Please, use .png/jpeg/jpg format")
      expect(handleChangeFiles).toHaveBeenCalled() // verifie que la methode a bien été appelé
      expect(alert).toBeTruthy() /// verifie si le message d'erreur s'affiche
      
    })
  })
    describe("When I add supporting file", () => {
      test("Then I submit data form", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = NewBillUI()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        
        const newBil = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })

        const conditionFormat = new File(["0 "], "test.jpg", {type: "image/jpg"}) //créé un nouveau fichier jpg

        const inputFile = screen.getByTestId("file")
        const handleChangeFiles = jest.fn((e) => newBil.handleChangeFile(e)) //simule la methode
        inputFile.addEventListener("change", handleChangeFiles) //ajoute un event change
        fireEvent.change(inputFile, {target: {files: [conditionFormat]}}) //ajoute le fichier jpg 
        expect(handleChangeFiles).toHaveBeenCalled() //verifie que la fonction a bien été appelé
        expect(inputFile.files[0]).toStrictEqual(conditionFormat) //verifie que le fichier contenu dans InputFile correspond au bon format

        
        const form = screen.getByTestId("form-new-bill")  
        const handleSubmits = jest.fn((e) => newBil.handleSubmit) // simule la method submit
      
        form.addEventListener("submit", handleSubmits) // ajoute un event submit
        fireEvent.submit(form) //simule l'envoie du formulaire
        expect(handleSubmits).toHaveBeenCalled() //verifie que la method a été appelé 
        expect(screen.getByText("Mes notes de frais")).toBeTruthy() //verifie que l'on revient à la page Bills
    })  
  })
  
})
})

// test intégration POST

describe("Given I am a user connected as Employee", () => {
  //Je suis connecté en tant qu'employée
  describe("When I sumbit form", () => {
    //Quand j'envoie le formulaire
    test("Then new bills is created", async() => {
      //Une nouvelle facture est créé
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()
     
      const okBill = { // génère un objet contenant l'ensemble des données dont le formulaire a besoin
      type: "Transports",
      name: "Vol Paris Londres",
      amount: "348",
      date: "22/06/2018" ,
      vat: "70",
      pct: "20",
      commentary: "No comment",
      fileUrl: "../img/test.jpg",
      fileName: "test.jpg",
      status: 'pending'
      }
      
      //associe les données de l'objet okBill au différent champs du formulaire
      screen.getByTestId("expense-type").value = okBill.type;
      screen.getByTestId("expense-name").value = okBill.name;
      screen.getByTestId("datepicker").value = okBill.date;
      screen.getByTestId("amount").value = okBill.amount;
      screen.getByTestId("vat").value = okBill.vat;
      screen.getByTestId("pct").value = okBill.pct;
      screen.getByTestId("commentary").value = okBill.commentary;
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = mockStore
      const newBil = new NewBill({
        document, onNavigate, store: store, localStorage: window.localStorage
      })


      newBil.fileUrl = okBill.fileUrl;
      newBil.fileName = okBill.fileName;

      newBil.updateBill = jest.fn() // simule la methode updateBill 

      const form = screen.getByTestId("form-new-bill")      
      const handleSubmits = jest.fn((e) => newBil.handleSubmit) //simule la methode submit
      
      form.addEventListener("submit", handleSubmits) //ajoute un event submit
      fireEvent.submit(form) //simule l'envoie d'un formulaire 
    

      expect(handleSubmits).toHaveBeenCalled() //verifie que la methode a été appelé
      expect(newBil.updateBill).toHaveBeenCalled() //verifie si le formulaire a bien été envoyer dans le store
          
    })
    test("fetches bills from an API and fails with 500 message error", async () => {
      //essaie d'envoyer une note de frais et avoir un retour error 500
    jest.spyOn(mockStore, "bills")
    jest.spyOn(console, 'error').mockImplementation(() => {}) // surveille le retour de la console
    Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
    )
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
    
    mockStore.bills.mockImplementationOnce(() => {
      return {
        update : () =>  {
          return Promise.reject(new Error('Erreur 500'))
          //retourne une erreur 500 lors de l'appel de l'API
        }
      }})
    window.onNavigate(ROUTES_PATH.NewBill)

    const newBil = new NewBill({
      document, onNavigate, store: mockStore, localStorage: window.localStorage
    })

       
    const form = screen.getByTestId("form-new-bill")      
    const handleSubmits = jest.fn((e) => newBil.handleSubmit)
  
    form.addEventListener("submit", handleSubmits)
    fireEvent.submit(form)


    await new Promise(process.nextTick);
    expect(console.error).toBeCalled() // verifie si une erreur console a été envoyée


    })
  })
})