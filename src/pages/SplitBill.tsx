import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, User, DollarSign } from 'lucide-react';

interface Person {
  id: number;
  name: string;
  amount: number;
}

const SplitBill = () => {
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: '', amount: 0 }
  ]);

  const addPerson = () => {
    setPeople([...people, { id: people.length + 1, name: '', amount: 0 }]);
  };

  const removePerson = (id: number) => {
    if (people.length > 1) {
      setPeople(people.filter(person => person.id !== id));
    }
  };

  const updatePerson = (id: number, field: keyof Person, value: string | number) => {
    setPeople(people.map(person => 
      person.id === id ? { ...person, [field]: value } : person
    ));
  };

  const calculateSplit = () => {
    const total = people.reduce((sum, person) => sum + person.amount, 0);
    setTotalAmount(total);
  };

  return (
    <div className="min-h-screen pt-16 pb-16 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Split Bill</h1>
          <p className="text-muted-foreground">
            Easily split bills with friends and track shared expenses
          </p>
        </motion.div>

        <Card className="bg-card/80 backdrop-blur-xs border-border/60">
          <CardContent className="p-6">
            <div className="space-y-6">
              {people.map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 items-end"
                >
                  <div className="flex-1">
                    <Label htmlFor={`name-${person.id}`}>Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`name-${person.id}`}
                        placeholder="Enter name"
                        value={person.name}
                        onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`amount-${person.id}`}>Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`amount-${person.id}`}
                        type="number"
                        placeholder="0.00"
                        value={person.amount}
                        onChange={(e) => updatePerson(person.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removePerson(person.id)}
                    className="mb-0.5"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={addPerson}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Person
                </Button>
              </div>

              <div className="pt-6 border-t border-border">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
                </div>
                <Button onClick={calculateSplit} className="w-full">
                  Calculate Split
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SplitBill; 