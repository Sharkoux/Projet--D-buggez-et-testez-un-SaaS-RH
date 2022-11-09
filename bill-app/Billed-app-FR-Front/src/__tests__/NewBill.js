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

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then new bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const MailIcon = screen.getByTestId('icon-mail')
      expect(MailIcon.classList.contains("active-icon")).toBeTruthy()
    })
    test("Then I add a supporting file", async () => {
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const newBil = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const inputFile = screen.getByTestId("file")
      const handleChangeFiles = jest.fn((e) => newBil.handleChangeFile(e))
      inputFile.addEventListener("input", handleChangeFiles)
      fireEvent.change(inputFile, {target: {file: 'test.jpg'}})
      expect(inputFile.file).toBe("test.jpg")
      //fireEvent.change(inputFile, {target: {file: 'test.pdf'}})
      //const alert = await screen.getByText("Please, use .png/jpeg/jpg format")
      //expect(alert).toBeTruthy()
    })
    test("Then I submit data form", async () => {
     
      document.body.innerHTML = NewBillUI()
    
      const store = null
      const newBil = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const form = screen.getByTestId("form-new-bill")      
      const handleSubmits = jest.fn((e) => e.preventDefault())
      
      form.addEventListener("submit", handleSubmits)
      fireEvent.submit(form)
      expect(handleSubmits).toHaveBeenCalled()
    }) 
  })

})
