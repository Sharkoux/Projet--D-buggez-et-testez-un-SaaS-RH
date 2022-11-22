/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills, {handleClickNewBill, handleClickIconEye} from "../containers/Bills.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
import Actions from "../views/Actions.js";

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  //Je suis connecté en tant qu’employé.
  describe("When I am on Bills Page", () => {
    //Je suis sur la page des Notes de Frais (Bills)
    test("Then bill icon in vertical layout should be highlighted", async () => {
      //L’icone des notes de frais dans la barre verticale est mis en surbrillance.

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
      //Les notes de frais sont affichées de la plus ancienne à la plus récentes
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
    
  describe('When I click on the icon eye',  () => {
    //Je clique sur l’icône Œil
    test("Then the modal opens", async () => {
      //Le modal s’ouvre et affiche le justificatif joint à la note de frais.
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        //simule les donnée du localstorage
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
        //simule la connexion avec un employee
      }))
      
      document.body.innerHTML = BillsUI({data: bills})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const bils = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
        //creation d'un nouvelle facture (class Bills)
      })
      $.fn.modal = jest.fn(); //Mock la modal
     
      const handleClickIconEyes = jest.fn((e) => bils.handleClickIconEye) // simule la methode handleClickIconEye
      
      const eyes = screen.getAllByTestId("icon-eye")[0]
      eyes.addEventListener("click", handleClickIconEyes) // add evenement click 
      fireEvent.click(eyes) //simule le click sur l'icone
      expect(handleClickIconEyes).toHaveBeenCalledTimes(1) // verifie que la methode simulé a été appelé
      expect($.fn.modal).toHaveBeenCalledTimes(1) //verifie si la modal mock a été appelé

    })
    describe("When I click to button NewBill", () => {
      //Je clique sur le bouton Nouvelles Notes de frais
    test("Then i go to newbills display", async () => {
      //Le formulaire pour envoyer une nouvelle note de frais s'affiche
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })   //simule les donnée du localstorage
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
        //simule la connexion en tant qu'employé
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const bils = new Bills({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })
      const btn = screen.getByTestId("btn-new-bill");
      const handleClickNewBills = jest.fn((e) => bils.handleClickNewBill(e, bills[0])) //simule la methode handleclicknewbills
      btn.addEventListener("click", handleClickNewBills) // ajoute event click sur le btn 
      fireEvent.click(btn) //simule click 
      expect(btn).toBeDefined(); //verifie si le bouton existe bien 
      expect(handleClickNewBills).toHaveBeenCalledTimes(1) //verifie si la method a bien été appelé 
      await waitFor(() => screen.getByTestId('form-new-bill'))
      const formNewBill = screen.getByTestId('form-new-bill')
      expect(formNewBill).toBeTruthy() //verifie que le formulaire s'affiche
    })
   
    })


  })


  // test d'intégration GET
  describe("Given I am a user connected as Employee", () => {
    //Je suis connecté en tant qu’employé.
  describe("When I navigate to Bills", () => {
    //Je suis sur la page des Notes de Frais (Bills)
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
        //simule connexion en tant qu'employé
      }))
      const billls = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage 
        //recupère donné du mockstore
      })
      const getBill = jest.fn((e) => billls.getBills()) // simule la method getBills
      const callBill = await getBill()
      
      expect(getBill).toHaveBeenCalledTimes(1) //verifie si getBills a été appelé 
      expect(callBill.length).toBe(4); //verifie que le nombre d'élément contenu dans callBill est égal à celui du mockstore
    })
  })

  // Test error 404 // 500
  describe("When an error occurs on API", () => {
      beforeEach(() => {
        //avant tout
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
              //simule les donnée du localstorage
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
          // simule la connexion en tant qu'employé
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("fetches bills from an API and fails with 404 message error", async () => {
  
        mockStore.bills.mockImplementationOnce(() => { 
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
              // on retourne une erreur 404 lors d'un appel de l'api 
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()  //on verifie que le message d'erreur s'affiche
      })
      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
               // on retourne une erreur 500 lors d'un appel de l'api 
            }
          }})
  
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy() //on verifie que le message d'erreur s'affiche
      })
    })
  })
})

