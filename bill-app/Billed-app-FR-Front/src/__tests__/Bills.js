/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills, {handleClickNewBill, handleClickIconEye} from "../containers/Bills.js";

import router from "../app/Router.js";
import Actions from "../views/Actions.js";
/*
window.$ = jest.fn().mockImplementation(() => {
  return {
     click: jest.fn(),
     width: jest.fn(),
     find: jest.fn()
     
   }
});
*/

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

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
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    
    test("Then go to newbill display", async () => {
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
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
      const handleClickNewBills = jest.fn((e) => bils.handleClickNewBill(e, bills[0]))
      btn.addEventListener("click", handleClickNewBills)
      fireEvent.click(btn)
      expect(btn).toBeDefined();
      expect(handleClickNewBills).toHaveBeenCalledTimes(1)
      await waitFor(() => screen.getByTestId('form-new-bill'))
      const formNewBill = screen.getByTestId('form-new-bill')
      expect(formNewBill).toBeTruthy()
    })
    /*
    test("Then add event click for ClickIconEye button", () => {
      const handleClickIconEyes = jest.fn(handleClickIconEye);
      document.body.innerHTML = BillsUI({ data: bills });
      const btn = screen.getAllByTestId("icon-eye");
      btn.forEach(icon => {
      icon.addEventListener("click", handleClickIconEyes)
      });
      fireEvent.click(btn[0]);
      expect(btn).toBeDefined();
      expect(handleClickIconEyes).toHaveBeenCalledTimes(1)
    })
    */
  })
  describe('When I click on the icon eye',  () => {
    test("Then the modal opens", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      document.body.innerHTML = BillsUI({data: bills})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const bils = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })
      $.fn.modal = jest.fn();
      const handleClickIconEyes = jest.fn((e) => bils.handleClickIconEye)
      
      const eyes = screen.getAllByTestId("icon-eye")[0]
      eyes.addEventListener("click", handleClickIconEyes)
      fireEvent.click(eyes)
      expect(handleClickIconEyes).toHaveBeenCalledTimes(1)
      expect($.fn.modal).toHaveBeenCalledTimes(1)

    })


  })

})
