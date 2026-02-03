import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Info, Trash2, Plus } from "lucide-react"

export default function TestComponents() {
  const [name, setName] = useState("")

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">UI Component Verification</h1>
          <p className="text-slate-500">Task-101 Checkpoint: Interstellar Blue Theme</p>
        </header>

        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default (Primary)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
            <Button className="rounded-full">Rounded</Button>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Inputs & Labels</h2>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input type="email" id="email" placeholder="Email" value={name} onChange={(e) => setName(e.target.value)} />
            <p className="text-sm text-slate-500">You typed: {name}</p>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice #001</CardTitle>
                <CardDescription>Created on Feb 2, 2026</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Total Amount: ¥1,200.00</p>
                <p className="text-xs text-slate-400 mt-2">Approved by Finance</p>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" size="sm">Details</Button>
                <Button size="sm">Download</Button>
              </CardFooter>
            </Card>

            <Card className="bg-slate-900 text-white border-slate-800">
               <CardHeader>
                <CardTitle className="text-white">Dark Card</CardTitle>
                <CardDescription className="text-slate-400">For special status</CardDescription>
              </CardHeader>
               <CardContent>
                 <p>Content goes here...</p>
               </CardContent>
            </Card>
          </div>
        </section>

        {/* ScrollArea Section */}
        <section className="space-y-4">
           <h2 className="text-xl font-semibold">4. ScrollArea</h2>
           <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4 bg-white">
             <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
             {Array.from({ length: 50 }).map((_, i) => (
               <div key={i} className="text-sm border-b py-2 text-slate-600">
                 Log entry #{i + 1} - System initialization successful.
               </div>
             ))}
           </ScrollArea>
        </section>

        {/* Dialog Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. Dialog</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline"><Trash2 className="w-4 h-4 mr-2" /> Delete Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="flex items-center gap-4">
                    <Info className="text-blue-500" />
                    <span className="text-sm">We will archive it for 30 days first.</span>
                 </div>
              </div>
              <DialogFooter>
                <Button type="submit">Confirm Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
        {/* State Verification Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">6. State & Storage Verification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <StateTestCard />
             <SettingsTestCard />
          </div>
        </section>
      </div>
    </div>
  )
}

import { useInvoiceStore } from "@/store/useInvoiceStore"
import { useSettingsStore } from "@/store/useSettingsStore"

function StateTestCard() {
  const { items, addItem, removeItem } = useInvoiceStore()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Items ({items.length})</CardTitle>
        <CardDescription>Persists to IDB: easyinvoice-storage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[150px] overflow-y-auto border p-2 rounded bg-slate-50">
          {items.map(item => (
            <div key={item.id} className="text-xs flex justify-between items-center p-1 bg-white border rounded">
              <span>{item.name}</span>
              <button 
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 font-bold px-2"
              >×</button>
            </div>
          ))}
          {items.length === 0 && <span className="text-xs text-muted-foreground p-1 block text-center">No items</span>}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          size="sm" 
          onClick={() => addItem({
             name: `Item ${items.length + 1}`,
             width: 100,
             height: 50,
             fileData: 'mock-base64-data',
             workspaceId: 'invoice'
          })}
        >
          <Plus className="w-3 h-3 mr-2" /> Add Mock Item
        </Button>
      </CardFooter>
    </Card>
  )
}

function SettingsTestCard() {
  const { settings, updateSettings } = useSettingsStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings Persistence</CardTitle>
        <CardDescription>Persists to IDB: easyinvoice-settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
         <div className="flex items-center justify-between">
           <Label htmlFor="showGrid">Show Grid</Label>
           <Input 
             id="showGrid" 
             type="checkbox" 
             className="w-4 h-4"
             checked={settings.showGrid}
             onChange={(e) => updateSettings({ showGrid: e.target.checked })} 
            />
         </div>
         <div className="text-xs text-muted-foreground mt-2">
           Current Margin: {settings.margin}mm
         </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm" variant="outline" onClick={() => updateSettings({ margin: 20 })}>Reset</Button>
        <Button size="sm" variant="secondary" onClick={() => updateSettings({ margin: settings.margin + 5 })}>+5mm</Button>
      </CardFooter>
    </Card>
  )
}
